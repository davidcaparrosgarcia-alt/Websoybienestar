import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { api } from "../services/api";
import { getOrMigrateUserProfile } from "../services/userProfile";

type GoalType = "Bienestar Mental" | "Actividad Física" | "Desarrollo Intelectual" | "Gestión de Emociones" | "Azar";
const GOAL_TYPES: GoalType[] = ["Bienestar Mental", "Actividad Física", "Desarrollo Intelectual", "Gestión de Emociones", "Azar"];

interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  completed: boolean;
  timestamp: string; // ISO date
  completedAt?: string;
  isHistorical?: boolean; // computed locally
}

// Function to check if a date is from a previous week (weeks string Monday, ending Sunday)
const isFromPreviousWeek = (dateString?: string) => {
  if (!dateString) return false;
  
  const now = new Date();
  
  // Calculate the most recent Monday at 00:00:00
  const currentMonday = new Date(now);
  const day = currentMonday.getDay(); // 0 is Sunday, 1 is Monday
  const diff = currentMonday.getDate() - day + (day === 0 ? -6 : 1);
  currentMonday.setDate(diff);
  currentMonday.setHours(0, 0, 0, 0);

  const goalDate = new Date(dateString);
  return goalDate < currentMonday;
};

export default function WeeklyGoals() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<GoalType>("Azar");
  
  const [isGenerating, setIsGenerating] = useState<string | null>(null); // goal id being generated

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'weeklyGoals'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGoals: Goal[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        let historical = false;
        if (data.completed && data.completedAt) {
          historical = isFromPreviousWeek(data.completedAt);
        } else if (!data.completed && data.timestamp) {
          historical = false;
        }

        fetchedGoals.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          type: data.type as GoalType,
          completed: data.completed,
          timestamp: data.timestamp,
          completedAt: data.completedAt,
          isHistorical: historical
        });
      });
      
      // Sort
      fetchedGoals.sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      
      setGoals(fetchedGoals);
    }, (error) => {
      console.error("Error fetching goals:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const activeGoals = goals.filter(g => !g.isHistorical);
  const totalActive = activeGoals.length;
  const completedActive = activeGoals.filter(g => g.completed).length;

  const nextResetStr = () => {
    return "Domingo, 23:59";
  };

  const handleAddEmptyGoal = async () => {
    if (!user) return;
    const newId = Date.now().toString();
    const newGoal = {
      title: "Nueva Meta",
      description: "¿Qué te propones alcanzar esta semana?",
      type: "Azar" as GoalType,
      completed: false,
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', user.uid, 'weeklyGoals', newId), newGoal);
    
    startEditing({ id: newId, ...newGoal });
  };

  const toggleComplete = async (goal: Goal) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'weeklyGoals', goal.id);
    if (!goal.completed) {
      await updateDoc(docRef, { 
        completed: true, 
        completedAt: new Date().toISOString() 
      });
    } else {
      await updateDoc(docRef, { 
        completed: false, 
        completedAt: null 
      });
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'weeklyGoals', id));
    } catch(e) {
      console.error(e);
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description);
    setEditType(goal.type);
  };

  const saveEdit = async () => {
    if (!user || !editingGoalId) return;
    await updateDoc(doc(db, 'users', user.uid, 'weeklyGoals', editingGoalId), {
      title: editTitle,
      description: editDescription,
      type: editType
    });
    setEditingGoalId(null);
  };

  const generateAIGoalInEdit = async () => {
    if (!user) return;
    setIsGenerating("edit");
    
    try {
      let accumulatedSummary = "";
      try {
        const { profileData } = await getOrMigrateUserProfile(user.uid);
        accumulatedSummary = profileData.globalUserSummary || "";
      } catch (e) { console.error(e) }

      const data = await api.weeklyGoal(editType, accumulatedSummary);

      setEditTitle(data.title || "Meta Sorpresa");
      setEditDescription(data.description || "Tómate un momento para descubrir qué necesitas esta semana.");

    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(null);
    }
  };

  const generateAIGoal = async (goalId: string, type: GoalType) => {
    if (!user) return;
    setIsGenerating(goalId);
    
    try {
      let accumulatedSummary = "";
      try {
        const { profileData } = await getOrMigrateUserProfile(user.uid);
        accumulatedSummary = profileData.globalUserSummary || "";
      } catch (e) { console.error(e) }

      const data = await api.weeklyGoal(type, accumulatedSummary);

      let finalizedType = type;
      if (type === "Azar") {
        finalizedType = "Azar";
      }

      await updateDoc(doc(db, 'users', user.uid, 'weeklyGoals', goalId), {
        title: data.title || "Meta Sorpresa",
        description: data.description || "Tómate un momento para descubrir qué necesitas esta semana.",
        type: finalizedType
      });

    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(null);
      setEditingGoalId(null);
    }
  };

  const repeatGoal = async (goal: Goal) => {
    if (!user) return;
    const newId = Date.now().toString();
    const newGoal = {
      title: goal.title,
      description: goal.description,
      type: goal.type,
      completed: false,
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', user.uid, 'weeklyGoals', newId), newGoal);
  };

  return (
    <div className="flex-1 bg-surface text-on-surface font-body w-full min-h-screen">
      <main className="pt-16 pb-20 max-w-7xl mx-auto px-8 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-primary">Tus Metas Semanales</h1>
            <p className="font-body text-lg text-secondary max-w-xl italic">
              Un espacio para cultivar la intención. Las metas no alcanzadas fluirán hacia tu próxima semana, permitiéndote avanzar sin presiones.
            </p>
          </div>

          {/* Progress Counter */}
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col items-center justify-center min-w-[200px] relative overflow-hidden border border-outline-variant/10">
            <div className="relative z-10 text-center">
              <span className="font-label text-xs uppercase tracking-widest text-secondary block mb-1">Progreso Actual</span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline text-4xl font-bold text-primary">{completedActive}</span>
                <span className="font-headline text-xl text-secondary">/ {totalActive === 0 ? 1 : totalActive}</span>
              </div>
            </div>
            {/* Lighthouse Progress Visualization */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-container-highest">
              <div 
                className="h-full bg-gradient-to-r from-secondary to-primary-fixed shadow-[0_0_10px_rgba(66,97,124,0.3)] transition-all duration-1000" 
                style={{ width: `${totalActive === 0 ? 0 : (completedActive / totalActive) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Objectives List */}
          <div className="lg:col-span-8 space-y-4">
            
            {goals.map((goal) => {
              const isEditing = editingGoalId === goal.id;
              
              if (isEditing) {
                return (
                  <div key={goal.id} className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-4 border border-primary/20 shadow-sm transition-all duration-500">
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-transparent font-headline text-xl font-semibold text-primary border-b border-outline/30 focus:border-primary focus:ring-0 px-0 py-2 placeholder:text-outline-variant outline-none"
                      placeholder="Título de tu meta..."
                    />
                    <textarea 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-transparent font-body text-secondary border-b border-outline/30 focus:border-primary focus:ring-0 px-0 py-2 resize-none placeholder:text-outline-variant outline-none"
                      rows={2}
                      placeholder="Descripción detallada de tus pasos a seguir..."
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                       {GOAL_TYPES.map((type) => {
                         const isSelected = editType === type;
                         return (
                           <div key={type} className="relative group/btntype">
                             <button 
                                onClick={() => {
                                  if (isSelected) {
                                    generateAIGoalInEdit();
                                  } else {
                                    setEditType(type);
                                  }
                                }}
                                disabled={isGenerating === "edit"}
                                className={`px-3 py-1 font-label text-xs rounded-full border transition-all ${isSelected ? 'bg-secondary text-white border-secondary' : 'bg-transparent text-secondary border-secondary/50 hover:bg-secondary/10'}`}
                             >
                               {isGenerating === "edit" && isSelected ? "Generando..." : type}
                             </button>
                             <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-[10px] font-medium px-3 py-1 rounded shadow-md opacity-0 pointer-events-none group-hover/btntype:opacity-100 transition-opacity whitespace-nowrap z-20">
                               Generar propuesta de objetivo
                             </span>
                           </div>
                         );
                       })}
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setEditingGoalId(null)} className="px-4 py-2 font-label text-sm text-secondary hover:text-primary transition-colors">Cancelar</button>
                      <button onClick={saveEdit} className="px-6 py-2 bg-primary text-white rounded-lg font-label text-sm hover:bg-primary-container transition-colors">Guardar</button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={goal.id} className={`group bg-surface-container-lowest hover:bg-white p-6 sm:p-8 rounded-xl flex items-start gap-4 sm:gap-6 transition-all duration-500 shadow-sm border border-transparent hover:border-outline-variant/10 ${goal.isHistorical ? 'opacity-60 grayscale-[30%]' : ''}`}>
                  <div className="pt-1 shrink-0">
                    <button 
                      onClick={() => toggleComplete(goal)}
                      disabled={goal.isHistorical}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${goal.completed ? 'border-primary-container text-primary-container bg-primary-fixed' : 'border-outline-variant text-transparent hover:border-primary-container disabled:cursor-not-allowed'}`}
                    >
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: goal.completed ? "'FILL' 1" : "'FILL' 0" }}>check</span>
                    </button>
                  </div>
                  
                  <div className="flex-grow space-y-2 relative">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-headline text-xl font-semibold text-primary pr-12 ${goal.completed ? 'line-through opacity-60' : ''}`}>{goal.title}</h3>
                    </div>
                    
                    <p className="text-secondary font-body whitespace-pre-wrap">{goal.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 pt-2 group-hover:bg-transparent">
                      <button 
                        onClick={() => generateAIGoal(goal.id, goal.type)}
                        disabled={!!isGenerating || goal.isHistorical}
                        className="px-3 py-1 bg-secondary-container/30 text-on-secondary-container text-xs font-label rounded-full hover:bg-secondary-container/60 transition-colors group/ai relative"
                      >
                        {isGenerating === goal.id ? "Generando..." : goal.type}
                        
                        {/* Hover Tooltip for AI gen */}
                        {!goal.isHistorical && (
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-[10px] font-medium px-3 py-1 rounded shadow-md opacity-0 pointer-events-none group-hover/ai:opacity-100 transition-opacity whitespace-nowrap z-20">
                            Generar propuesta de objetivo
                          </span>
                        )}
                      </button>

                      {goal.completed && !goal.isHistorical && (
                        <span className="text-xs text-outline font-label italic flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">history</span> Completado
                        </span>
                      )}
                      
                      {!goal.completed && !goal.isHistorical && (
                        <span className="text-xs text-primary font-label font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">pending</span> Pendiente
                        </span>
                      )}

                      {!goal.isHistorical && (
                        <div className="flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                          <button onClick={() => startEditing(goal)} className="p-2 hover:bg-surface-container rounded-full text-secondary transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => deleteGoal(goal.id)} className="p-2 hover:bg-error-container hover:text-error rounded-full text-secondary transition-colors" title="Eliminar">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {goal.isHistorical && (
                      <div className="pt-4 mt-2 border-t border-outline-variant/10">
                        <button 
                          onClick={() => repeatGoal(goal)}
                          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-label uppercase tracking-widest font-bold hover:bg-primary-container transition-colors"
                        >
                          Repetir Objetivo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {!isGenerating && (
              <button 
                onClick={handleAddEmptyGoal}
                className="w-full py-6 border-2 border-dashed border-outline-variant/50 rounded-xl flex items-center justify-center gap-3 text-secondary hover:text-primary hover:border-primary transition-all group"
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span className="font-label font-medium">Añadir Nueva Meta Semanal</span>
              </button>
            )}

            {goals.length === 0 && !isGenerating && (
              <p className="text-center text-outline-variant font-body italic mt-8">
                Aún no tienes propósitos esta semana. Haz clic en "Añadir Nueva Meta Semanal" para comenzar.
              </p>
            )}

            <div className="mt-8">
              <button onClick={() => navigate('/zen')} className="group flex items-center gap-2 text-secondary font-label text-sm hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Regresar
              </button>
            </div>
          </div>

          {/* Sidebar Info/Carry Over Logic */}
          <div className="lg:col-span-4 space-y-8">
            {/* Carry Over Information Card */}
            <div className="bg-primary text-on-primary p-8 rounded-xl relative overflow-hidden shadow-lg shadow-primary/10">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-fixed">auto_mode</span>
                  <h4 className="font-headline text-xl">Lógica de Continuidad</h4>
                </div>
                <p className="font-body text-sm text-on-primary-container leading-relaxed">
                  En nuestra filosofía, el tiempo no es un juez. Las metas marcadas como "pendientes" al finalizar el domingo se trasladarán automáticamente a tu plan de la siguiente semana.
                </p>
                <div className="pt-4 border-t border-on-primary/10">
                  <span className="font-label text-xs uppercase tracking-wider block mb-2 opacity-70">Próximo Reinicio</span>
                  <span className="font-headline text-lg">{nextResetStr()}</span>
                </div>
              </div>
              {/* Decorative Foggy Background Element */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary rounded-full blur-[60px] opacity-20"></div>
            </div>
            
            {/* Visual Anchor Image */}
            <div className="rounded-xl overflow-hidden aspect-[4/5] shadow-xl group relative bg-surface-container">
              <img 
                alt="Sanctuary" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-1UQLn6POnnUDGT5YuvxyJSRNfpPqEZOHFOdbRof4Sw_uduReZRl4LZD75owj1EEJ7YsXj67sBj0uY89m2Si7fQliPst1bOCpDvw3QGg0UMipGUS0bVD3OEOcoP-TPu7FBGATQWrZMXqmpZ9ls7n9MTlQsb8Ekb54pLK5HahTvwaSg7R1EGvQlhNG-VwRjL3UdfwHXTHzcAA4dow20RGOjb6Vb9PudZuF6GiGwO3rRdvgZldaHmekMjwkUBBLGYUnKPBTdU4OLEzT"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

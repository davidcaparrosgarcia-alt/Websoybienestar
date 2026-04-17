import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  limit, 
  writeBatch,
  documentId,
  getCountFromServer
} from "firebase/firestore";
import { getOrMigrateUserProfile } from "./userProfile";

const CLEANUP_INTERVAL_DAYS = 7;
const DETAIL_RETENTION_DAYS = 90; // Prompt rule: Drop old operational data after 90 days.
const TEXT_SCRUB_DAYS = 1; // Delete raw entry texts (entry1, entry2) after a day
const DELETE_BATCH_LIMIT = 25; 

function getDailyStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Ejecuta una limpieza "lazy" mantenida y controlada.
 * Se llama cuando el usuario entra en la aplicación.
 */
export async function runLazyDataRetentionAndCleanup(uid: string) {
  if (!uid) return;

  try {
    const { userRef, profileRef, userData, profileData } = await getOrMigrateUserProfile(uid);
    const now = new Date();

    const lastCleanupAt = userData.lastCleanupAt ? new Date(userData.lastCleanupAt) : null;

    // Actualizamos actividad
    const userUpdates: any = {
      lastActiveAt: now.toISOString(),
    };

    // Comprobamos si debemos hacer limpieza (han pasado más de 7 días o nunca se ha hecho)
    let shouldCleanup = false;
    let shouldWipeTotals = false;
    
    const lastActiveAt = userData.lastActiveAt ? new Date(userData.lastActiveAt) : now;
    const diffInactivityDays = (now.getTime() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);

    if (!lastCleanupAt) {
      shouldCleanup = true;
    } else {
      const diffDays = (now.getTime() - lastCleanupAt.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= CLEANUP_INTERVAL_DAYS) {
        shouldCleanup = true;
      }
    }
    
    // Solo permitimos el WIPE agresivo de datos antiguos si el usuario lleva inactivo 90 días o más
    if (diffInactivityDays >= DETAIL_RETENTION_DAYS) {
       shouldWipeTotals = true;
    }

    if (shouldCleanup) {
      const batch = writeBatch(db);
      let operationsCount = 0;
      const diaryRef = collection(db, "users", uid, "diaryEntries");

      // 1. Limpieza de datos total agresiva por INACTIVIDAD DE USUARIO (WIPE)
      if (shouldWipeTotals) {
          const cutoffDate = new Date();
          cutoffDate.setDate(now.getDate() - DETAIL_RETENTION_DAYS);
          const cutoffStr = getDailyStr(cutoffDate);
          const cutoffISO = cutoffDate.toISOString();

          // Limpiar Diary Entries antiguos completamente
          const oldDiariesQ = query(
            diaryRef,
            where(documentId(), "<", cutoffStr),
            limit(DELETE_BATCH_LIMIT)
          );
          const oldDiaries = await getDocs(oldDiariesQ);
          
          oldDiaries.forEach((d) => {
            batch.delete(d.ref);
            operationsCount++;
          });

          // Limpiar Weekly Goals antiguos
          if (operationsCount < 25) {
             const goalsRef = collection(db, "users", uid, "weeklyGoals");
             const goalsQuery = query(
               goalsRef,
               where("timestamp", "<", cutoffISO),
               limit(DELETE_BATCH_LIMIT)
             );
             const oldGoals = await getDocs(goalsQuery);
             
             oldGoals.forEach((d) => {
               batch.delete(d.ref);
               operationsCount++;
             });
          }
      }
      
      // 2. Scrub textos crudos > 1 days (Protección continua en usuarios ACTIVOS)
      if (operationsCount < 15) { 
         const scrubDate = new Date();
         scrubDate.setDate(now.getDate() - TEXT_SCRUB_DAYS);
         const scrubStr = getDailyStr(scrubDate);

         const textScrubQ = query(
           diaryRef,
           where(documentId(), "<", scrubStr),
           limit(DELETE_BATCH_LIMIT)
         );
         const scrubDiaries = await getDocs(textScrubQ);
         scrubDiaries.forEach((d) => {
           const ddata = d.data();
           if (ddata.entry1 || ddata.entry2) {
             batch.update(d.ref, {
                entry1: null,
                entry2: null
             });
             operationsCount++;
           }
         });
      }



      if (operationsCount > 0) {
        await batch.commit();
        console.log(`[DataRetention] Executed ${operationsCount} operations.`);
      }

      // 2. Generar resúmenes rápidos
      try {
        const diaryCountSnap = await getCountFromServer(diaryRef);
        const goalsRef = collection(db, "users", uid, "weeklyGoals");
        const goalsCountSnap = await getCountFromServer(goalsRef);

        const profileUpdates: any = {
           "diaryProfile.totalDaysUsed": diaryCountSnap.data().count,
           "exerciseProfile.summary": `Goals generados: ${goalsCountSnap.data().count}`
        };
        await updateDoc(profileRef, profileUpdates);
      } catch (countError) {
        console.warn("[DataRetention] Skipping counts", countError);
      }

      userUpdates.lastCleanupAt = now.toISOString();
      userUpdates.cleanupVersion = 2;
    }

    // Persistimos datos de última actividad
    await updateDoc(userRef, userUpdates);

  } catch (error) {
    console.error("[DataRetention] Error executing lazy cleanup:", error);
  }
}

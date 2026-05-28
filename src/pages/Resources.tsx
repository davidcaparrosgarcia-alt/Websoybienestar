import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";

const MATRIZ_ESTADOS = [
  {"sentimiento":0,"energia":0,"sintoma":"Bloqueo absoluto","explicacion":"Sientes un sufrimiento muy intenso y el cuerpo está sin fuerzas, como si todo pesara demasiado."},
  {"sentimiento":0,"energia":1,"sintoma":"Bloqueo absoluto","explicacion":"Sientes un sufrimiento muy intenso y el cuerpo está sin fuerzas, como si todo pesara demasiado."},
  {"sentimiento":0,"energia":2,"sintoma":"Bloqueo absoluto","explicacion":"Sientes un sufrimiento muy intenso y el cuerpo está sin fuerzas, como si todo pesara demasiado."},
  {"sentimiento":0,"energia":3,"sintoma":"Hundimiento emocional","explicacion":"El ánimo está muy bajo y tu energía apenas te permite avanzar despacio, con sensación de apatía y pesadez."},
  {"sentimiento":0,"energia":4,"sintoma":"Hundimiento emocional","explicacion":"El ánimo está muy bajo y tu energía apenas te permite avanzar despacio, con sensación de apatía y pesadez."},
  {"sentimiento":0,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":0,"energia":6,"sintoma":"Desesperación contenida / Frustración","explicacion":"Hay un malestar muy fuerte junto a un impulso interno acelerado, lo que puede sentirse como rabia, impotencia o ganas de estallar."},
  {"sentimiento":0,"energia":7,"sintoma":"Desesperación contenida / Frustración","explicacion":"Hay un malestar muy fuerte junto a un impulso interno acelerado, lo que puede sentirse como rabia, impotencia o ganas de estallar."},
  {"sentimiento":0,"energia":8,"sintoma":"Alarma extrema / Crisis de ansiedad","explicacion":"El sufrimiento es muy alto y el cuerpo está muy activado, con sensación de urgencia, tensión y necesidad de escapar."},
  {"sentimiento":0,"energia":9,"sintoma":"Alarma extrema / Crisis de ansiedad","explicacion":"El sufrimiento es muy alto y el cuerpo está muy activado, con sensación de urgencia, tensión y necesidad de escapar."},
  {"sentimiento":0,"energia":10,"sintoma":"Alarma extrema / Crisis de ansiedad","explicacion":"El sufrimiento es muy alto y el cuerpo está muy activado, con sensación de urgencia, tensión y necesidad de escapar."},
  {"sentimiento":1,"energia":0,"sintoma":"Angustia paralizante","explicacion":"Sientes mucha angustia y muy poca energía, con una sensación de bloqueo difícil de mover."},
  {"sentimiento":1,"energia":1,"sintoma":"Angustia paralizante","explicacion":"Sientes mucha angustia y muy poca energía, con una sensación de bloqueo difícil de mover."},
  {"sentimiento":1,"energia":2,"sintoma":"Angustia paralizante","explicacion":"Sientes mucha angustia y muy poca energía, con una sensación de bloqueo difícil de mover."},
  {"sentimiento":1,"energia":3,"sintoma":"Melancolía profunda","explicacion":"El ánimo está muy bajo y tu energía apenas te permite avanzar despacio, con sensación de apatía y pesadez."},
  {"sentimiento":1,"energia":4,"sintoma":"Melancolía profunda","explicacion":"El ánimo está muy bajo y tu energía apenas te permite avanzar despacio, con sensación de apatía y pesadez."},
  {"sentimiento":1,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":1,"energia":6,"sintoma":"Desesperación contenida / Frustración","explicacion":"Hay un malestar fuerte junto a un impulso interno acelerado, lo que puede sentirse como rabia, impotencia o ganas de estallar."},
  {"sentimiento":1,"energia":7,"sintoma":"Desesperación contenida / Frustración","explicacion":"Hay un malestar fuerte junto a un impulso interno acelerado, lo que puede sentirse como rabia, impotencia o ganas de estallar."},
  {"sentimiento":1,"energia":8,"sintoma":"Alarma extrema / Crisis de ansiedad","explicacion":"El sufrimiento es muy alto y el cuerpo está muy activado, con sensación de urgencia, tensión y necesidad de escapar."},
  {"sentimiento":1,"energia":9,"sintoma":"Alarma extrema / Crisis de ansiedad","explicacion":"El sufrimiento es muy alto y el cuerpo está muy activado, con sensación de urgencia, tensión y necesidad de escapar."},
  {"sentimiento":1,"energia":10,"sintoma":"Alarma extrema / Crisis de ansiedad","explicacion":"El sufrimiento es muy alto y el cuerpo está muy activado, con sensación de urgencia, tensión y necesidad de escapar."},
  {"sentimiento":2,"energia":0,"sintoma":"Dolor interno con bloqueo","explicacion":"Hay mucho malestar y casi nada de energía disponible, por lo que reaccionar puede costar bastante."},
  {"sentimiento":2,"energia":1,"sintoma":"Dolor interno con bloqueo","explicacion":"Hay mucho malestar y casi nada de energía disponible, por lo que reaccionar puede costar bastante."},
  {"sentimiento":2,"energia":2,"sintoma":"Dolor interno con bloqueo","explicacion":"Hay mucho malestar y casi nada de energía disponible, por lo que reaccionar puede costar bastante."},
  {"sentimiento":2,"energia":3,"sintoma":"Desánimo intenso","explicacion":"El ánimo está muy bajo y tu energía apenas te permite avanzar despacio, con sensación de apatía y pesadez."},
  {"sentimiento":2,"energia":4,"sintoma":"Desánimo intenso","explicacion":"El ánimo está muy bajo y tu energía apenas te permite avanzar despacio, con sensación de apatía y pesadez."},
  {"sentimiento":2,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":2,"energia":6,"sintoma":"Desesperación contenida / Frustración","explicacion":"Hay un malestar marcada junto a un impulso interno acelerado, lo que puede sentirse como rabia, impotencia o ganas de estallar."},
  {"sentimiento":2,"energia":7,"sintoma":"Desesperación contenida / Frustración","explicacion":"Hay un malestar marcada junto a un impulso interno acelerado, lo que puede sentirse como rabia, impotencia o ganas de estallar."},
  {"sentimiento":2,"energia":8,"sintoma":"Alarma extrema / Crisis de ansiedad","explicacion":"El sufrimiento es muy alto y el cuerpo está muy activado, con sensación de urgencia, tensión y necesidad de escapar."},
  {"sentimiento":2,"energia":9,"sintoma":"Alarma extrema / Crisis de ansiedad","explicacion":"El sufrimiento es muy alto y el cuerpo está muy activado, con sensación de urgencia, tensión y necesidad de escapar."},
  {"sentimiento":2,"energia":10,"sintoma":"Alarma extrema / Crisis de ansiedad","explicacion":"El sufrimiento es muy alto y el cuerpo está muy activado, con sensación de urgencia, tensión y necesidad de escapar."},
  {"sentimiento":3,"energia":0,"sintoma":"Desmotivación por cansancio / Bajón físico","explicacion":"Te sientes incómodo o bajo de ánimo, y el cansancio físico hace que todo parezca más pesado de lo normal."},
  {"sentimiento":3,"energia":1,"sintoma":"Desmotivación por cansancio / Bajón físico","explicacion":"Te sientes incómodo o bajo de ánimo, y el cansancio físico hace que todo parezca más pesado de lo normal."},
  {"sentimiento":3,"energia":2,"sintoma":"Desmotivación por cansancio / Bajón físico","explicacion":"Te sientes incómodo o bajo de ánimo, y el cansancio físico hace que todo parezca más pesado de lo normal."},
  {"sentimiento":3,"energia":3,"sintoma":"Desmotivación por cansancio / Bajón físico","explicacion":"Te sientes incómodo o bajo de ánimo, y el cansancio físico hace que todo parezca más pesado de lo normal."},
  {"sentimiento":3,"energia":4,"sintoma":"Estrés por sobrecarga / Agobio ordinario","explicacion":"Hay malestar moderado con energía suficiente para seguir, pero con sensación de carga, presión o desgaste."},
  {"sentimiento":3,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":3,"energia":6,"sintoma":"Estrés por sobrecarga / Agobio ordinario","explicacion":"Hay malestar moderado con energía suficiente para seguir, pero con sensación de carga, presión o desgaste."},
  {"sentimiento":3,"energia":7,"sintoma":"Ansiedad nerviosa / Nerviosismo acelerado","explicacion":"Sientes incomodidad y el cuerpo está demasiado activado, con tensión, inquietud y la mente yendo muy rápido."},
  {"sentimiento":3,"energia":8,"sintoma":"Ansiedad nerviosa / Nerviosismo acelerado","explicacion":"Sientes incomodidad y el cuerpo está demasiado activado, con tensión, inquietud y la mente yendo muy rápido."},
  {"sentimiento":3,"energia":9,"sintoma":"Ansiedad nerviosa / Nerviosismo acelerado","explicacion":"Sientes incomodidad y el cuerpo está demasiado activado, con tensión, inquietud y la mente yendo muy rápido."},
  {"sentimiento":3,"energia":10,"sintoma":"Ansiedad nerviosa / Nerviosismo acelerado","explicacion":"Sientes incomodidad y el cuerpo está demasiado activado, con tensión, inquietud y la mente yendo muy rápido."},
  {"sentimiento":4,"energia":0,"sintoma":"Desmotivación por cansancio / Bajón físico","explicacion":"Te sientes incómodo o bajo de ánimo, y el cansancio físico hace que todo parezca más pesado de lo normal."},
  {"sentimiento":4,"energia":1,"sintoma":"Desmotivación por cansancio / Bajón físico","explicacion":"Te sientes incómodo o bajo de ánimo, y el cansancio físico hace que todo parezca más pesado de lo normal."},
  {"sentimiento":4,"energia":2,"sintoma":"Desmotivación por cansancio / Bajón físico","explicacion":"Te sientes incómodo o bajo de ánimo, y el cansancio físico hace que todo parezca más pesado de lo normal."},
  {"sentimiento":4,"energia":3,"sintoma":"Desmotivación por cansancio / Bajón físico","explicacion":"Te sientes incómodo o bajo de ánimo, y el cansancio físico hace que todo parezca más pesado de lo normal."},
  {"sentimiento":4,"energia":4,"sintoma":"Estrés por sobrecarga / Agobio ordinario","explicacion":"Hay malestar moderado con energía suficiente para seguir, pero con sensación de carga, presión o desgaste."},
  {"sentimiento":4,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":4,"energia":6,"sintoma":"Estrés por sobrecarga / Agobio ordinario","explicacion":"Hay malestar moderado con energía suficiente para seguir, pero con sensación de carga, presión o desgaste."},
  {"sentimiento":4,"energia":7,"sintoma":"Ansiedad nerviosa / Nerviosismo acelerado","explicacion":"Sientes incomodidad y el cuerpo está demasiado activado, con tensión, inquietud y la mente yendo muy rápido."},
  {"sentimiento":4,"energia":8,"sintoma":"Ansiedad nerviosa / Nerviosismo acelerado","explicacion":"Sientes incomodidad y el cuerpo está demasiado activado, con tensión, inquietud y la mente yendo muy rápido."},
  {"sentimiento":4,"energia":9,"sintoma":"Ansiedad nerviosa / Nerviosismo acelerado","explicacion":"Sientes incomodidad y el cuerpo está demasiado activado, con tensión, inquietud y la mente yendo muy rápido."},
  {"sentimiento":4,"energia":10,"sintoma":"Ansiedad nerviosa / Nerviosismo acelerado","explicacion":"Sientes incomodidad y el cuerpo está demasiado activado, con tensión, inquietud y la mente yendo muy rápido."},
  {"sentimiento":5,"energia":0,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":1,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":2,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":3,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":4,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":6,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":7,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":8,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":9,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":5,"energia":10,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":6,"energia":0,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":6,"energia":1,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":6,"energia":2,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":6,"energia":3,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":6,"energia":4,"sintoma":"Equilibrio / Bienestar estable","explicacion":"Te sientes bastante bien y con energía suficiente para funcionar con calma, claridad y comodidad."},
  {"sentimiento":6,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":6,"energia":6,"sintoma":"Equilibrio / Bienestar estable","explicacion":"Te sientes bastante bien y con energía suficiente para funcionar con calma, claridad y comodidad."},
  {"sentimiento":6,"energia":7,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":6,"energia":8,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":6,"energia":9,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":6,"energia":10,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":7,"energia":0,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":7,"energia":1,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":7,"energia":2,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":7,"energia":3,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":7,"energia":4,"sintoma":"Equilibrio / Bienestar estable","explicacion":"Te sientes bastante bien y con energía suficiente para funcionar con calma, claridad y comodidad."},
  {"sentimiento":7,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":7,"energia":6,"sintoma":"Equilibrio / Bienestar estable","explicacion":"Te sientes bastante bien y con energía suficiente para funcionar con calma, claridad y comodidad."},
  {"sentimiento":7,"energia":7,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":7,"energia":8,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":7,"energia":9,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":7,"energia":10,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":8,"energia":0,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":8,"energia":1,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":8,"energia":2,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":8,"energia":3,"sintoma":"Relajación / Descanso reparador","explicacion":"Te sientes bien y con poca energía, un estado adecuado para descansar, recuperar fuerzas y bajar el ritmo."},
  {"sentimiento":8,"energia":4,"sintoma":"Equilibrio / Bienestar estable","explicacion":"Te sientes bastante bien y con energía suficiente para funcionar con calma, claridad y comodidad."},
  {"sentimiento":8,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":8,"energia":6,"sintoma":"Equilibrio / Bienestar estable","explicacion":"Te sientes bastante bien y con energía suficiente para funcionar con calma, claridad y comodidad."},
  {"sentimiento":8,"energia":7,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":8,"energia":8,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":8,"energia":9,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":8,"energia":10,"sintoma":"Motivación alta / Acción enfocada","explicacion":"Te sientes bien y con energía alta, un buen momento para crear, moverte, trabajar con foco o hacer ejercicio."},
  {"sentimiento":9,"energia":0,"sintoma":"Bienestar sereno / Descanso pleno","explicacion":"Te sientes muy bien aunque el cuerpo esté tranquilo o cansado, ideal para descansar con una sensación profunda de paz."},
  {"sentimiento":9,"energia":1,"sintoma":"Bienestar sereno / Descanso pleno","explicacion":"Te sientes muy bien aunque el cuerpo esté tranquilo o cansado, ideal para descansar con una sensación profunda de paz."},
  {"sentimiento":9,"energia":2,"sintoma":"Bienestar sereno / Descanso pleno","explicacion":"Te sientes muy bien aunque el cuerpo esté tranquilo o cansado, ideal para descansar con una sensación profunda de paz."},
  {"sentimiento":9,"energia":3,"sintoma":"Bienestar sereno / Descanso pleno","explicacion":"Te sientes muy bien aunque el cuerpo esté tranquilo o cansado, ideal para descansar con una sensación profunda de paz."},
  {"sentimiento":9,"energia":4,"sintoma":"Bienestar alto / Claridad estable","explicacion":"Te sientes muy bien y con energía equilibrada, con una sensación clara de satisfacción, seguridad y presencia."},
  {"sentimiento":9,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":9,"energia":6,"sintoma":"Bienestar alto / Claridad estable","explicacion":"Te sientes muy bien y con energía equilibrada, con una sensación clara de satisfacción, seguridad y presencia."},
  {"sentimiento":9,"energia":7,"sintoma":"Plenitud total / Alegría a tope","explicacion":"Te sientes plenamente bien y con mucha energía, como si tu cuerpo y tu ánimo estuvieran alineados y radiantes."},
  {"sentimiento":9,"energia":8,"sintoma":"Plenitud total / Alegría a tope","explicacion":"Te sientes plenamente bien y con mucha energía, como si tu cuerpo y tu ánimo estuvieran alineados y radiantes."},
  {"sentimiento":9,"energia":9,"sintoma":"Plenitud total / Alegría a tope","explicacion":"Te sientes plenamente bien y con mucha energía, como si tu cuerpo y tu ánimo estuvieran alineados y radiantes."},
  {"sentimiento":9,"energia":10,"sintoma":"Plenitud total / Alegría a tope","explicacion":"Te sientes plenamente bien y con mucha energía, como si tu cuerpo y tu ánimo estuvieran alineados y radiantes."},
  {"sentimiento":10,"energia":0,"sintoma":"Bienestar sereno / Descanso pleno","explicacion":"Te sientes muy bien aunque el cuerpo esté tranquilo o cansado, ideal para descansar con una sensación profunda de paz."},
  {"sentimiento":10,"energia":1,"sintoma":"Bienestar sereno / Descanso pleno","explicacion":"Te sientes muy bien aunque el cuerpo esté tranquilo o cansado, ideal para descansar con una sensación profunda de paz."},
  {"sentimiento":10,"energia":2,"sintoma":"Bienestar sereno / Descanso pleno","explicacion":"Te sientes muy bien aunque el cuerpo esté tranquilo o cansado, ideal para descansar con una sensación profunda de paz."},
  {"sentimiento":10,"energia":3,"sintoma":"Bienestar sereno / Descanso pleno","explicacion":"Te sientes muy bien aunque el cuerpo esté tranquilo o cansado, ideal para descansar con una sensación profunda de paz."},
  {"sentimiento":10,"energia":4,"sintoma":"Bienestar alto / Claridad estable","explicacion":"Te sientes muy bien y con energía equilibrada, con una sensación clara de satisfacción, seguridad y presencia."},
  {"sentimiento":10,"energia":5,"sintoma":"Calma plana / Neutralidad","explicacion":"Estás en un punto medio: ni claramente bien ni claramente mal, con una sensación de pausa útil para observarte sin forzarte."},
  {"sentimiento":10,"energia":6,"sintoma":"Bienestar alto / Claridad estable","explicacion":"Te sientes muy bien y con energía equilibrada, con una sensación clara de satisfacción, seguridad y presencia."},
  {"sentimiento":10,"energia":7,"sintoma":"Plenitud total / Alegría a tope","explicacion":"Te sientes plenamente bien y con mucha energía, como si tu cuerpo y tu ánimo estuvieran alineados y radiantes."},
  {"sentimiento":10,"energia":8,"sintoma":"Plenitud total / Alegría a tope","explicacion":"Te sientes plenamente bien y con mucha energía, como si tu cuerpo y tu ánimo estuvieran alineados y radiantes."},
  {"sentimiento":10,"energia":9,"sintoma":"Plenitud total / Alegría a tope","explicacion":"Te sientes plenamente bien y con mucha energía, como si tu cuerpo y tu ánimo estuvieran alineados y radiantes."},
  {"sentimiento":10,"energia":10,"sintoma":"Plenitud total / Alegría a tope","explicacion":"Te sientes plenamente bien y con mucha energía, como si tu cuerpo y tu ánimo estuvieran alineados y radiantes."}
];

export default function Resources() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://soybienestar.es/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Herramientas",
        "item": "https://soybienestar.es/herramientas"
      }
    ]
  };

  const resourcesServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://soybienestar.es/herramientas#service",
    "name": "Herramientas para calmar la ansiedad y el estrés",
    "serviceType": "Recursos online de respiración, meditación y autorregulación emocional",
    "provider": {
      "@id": "https://soybienestar.es/#organization"
    },
    "areaServed": {
      "@type": "Country",
      "name": "España"
    },
    "url": "https://soybienestar.es/herramientas",
    "description": "Recursos online de respiración, meditación personalizada, diario de agradecimientos, metas semanales y herramientas prácticas para bajar activación, recuperar foco y ordenar emociones."
  };

  // Modals state
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [selectedBreathingInfographic, setSelectedBreathingInfographic] = useState<{ id: string, src: string } | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [pendingAction, setPendingAction] = useState<"reservado" | "emocional" | null>(null);
  const [isGrayscaleForceOff, setIsGrayscaleForceOff] = useState(false);

  // Mobile interactions state
  const [showBreathingText, setShowBreathingText] = useState(false);
  const breathingTimer = useRef<NodeJS.Timeout | null>(null);

  const [showGestionsTextBg, setShowGestionsTextBg] = useState(false);
  const gestionTimer = useRef<NodeJS.Timeout | null>(null);

  const [showGoalsText, setShowGoalsText] = useState(false);
  const goalsTimer = useRef<NodeJS.Timeout | null>(null);

  const [showGratitudeText, setShowGratitudeText] = useState(false);
  const gratitudeTimer = useRef<NodeJS.Timeout | null>(null);

  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

  const toggleMobileText = (type: 'breathing' | 'gestion' | 'goals' | 'gratitude') => {
    if (!isTouchDevice()) return;

    if (type === 'breathing') setShowBreathingText((prev) => !prev);
    if (type === 'gestion') setShowGestionsTextBg((prev) => !prev);
    if (type === 'goals') setShowGoalsText((prev) => !prev);
    if (type === 'gratitude') setShowGratitudeText((prev) => !prev);
  };

  const handlePointerDown = (type: 'breathing' | 'gestion' | 'goals' | 'gratitude') => {
    if (!isTouchDevice()) return;

    const timer = setTimeout(() => {
      if (type === 'breathing') setIsBreathingModalOpen(true);
      if (type === 'gestion') setSelectedBreathingInfographic({ id: 'gestion_emocional', src: '/images/info-terapia-cognitiva.jpg' });
      if (type === 'goals') navigate('/weekly-goals');
      if (type === 'gratitude') navigate('/emotion-diary');
    }, 750);
    
    if (type === 'breathing') breathingTimer.current = timer;
    if (type === 'gestion') gestionTimer.current = timer;
    if (type === 'goals') goalsTimer.current = timer;
    if (type === 'gratitude') gratitudeTimer.current = timer;
  };

  const handlePointerUp = (type: 'breathing' | 'gestion' | 'goals' | 'gratitude') => {
    if (type === 'breathing' && breathingTimer.current) clearTimeout(breathingTimer.current);
    if (type === 'gestion' && gestionTimer.current) clearTimeout(gestionTimer.current);
    if (type === 'goals' && goalsTimer.current) clearTimeout(goalsTimer.current);
    if (type === 'gratitude' && gratitudeTimer.current) clearTimeout(gratitudeTimer.current);
  };

  useEffect(() => {
    // Scroll to color effect
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('grayscale', 'contrast-110');
          entry.target.classList.add('grayscale-0', 'contrast-100');
        } else {
          entry.target.classList.add('grayscale', 'contrast-110');
          entry.target.classList.remove('grayscale-0', 'contrast-100');
        }
      });
    }, { threshold: 0.5 });

    const imgs = document.querySelectorAll('.dynamic-color-img');
    imgs.forEach(img => observer.observe(img));

    return () => observer.disconnect();
  }, []);

  // Audio Player State
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Code Modal State
  const [accessCode, setAccessCode] = useState(["", "", "", ""]);
  
  // Estado Actual Tool State
  const [estadoPaso, setEstadoPaso] = useState<"inicio" | "sentimiento" | "energia" | "resultado">("inicio");
  const [valorSentimiento, setValorSentimiento] = useState<number | null>(null);
  const [valorEnergia, setValorEnergia] = useState<number | null>(null);

  const resetEstadoActual = () => {
    setEstadoPaso("inicio");
    setValorSentimiento(null);
    setValorEnergia(null);
  };

  const handleSentimientoSelect = (val: number) => {
    setValorSentimiento(val);
    setEstadoPaso("energia");
  };

  const handleEnergiaSelect = (val: number) => {
    setValorEnergia(val);
    setEstadoPaso("resultado");
  };

  const getResultadoEstado = () => {
    if (valorSentimiento === null || valorEnergia === null) return null;
    return MATRIZ_ESTADOS.find(
      (m) => m.sentimiento === valorSentimiento && m.energia === valorEnergia
    );
  };
  
  const meditations = [
    {
      id: "breve",
      title: "La Niebla Mental",
      type: "Meditación Breve",
      duration: "Aprox 5 min",
      src: "/audios/meditacion_guiada_breve/meditacion_guiada_breve.m4a"
    },
    {
      id: "standard",
      title: "Ducha de lluvia",
      type: "Meditación Standard",
      duration: "Aprox 15 min",
      src: "/audios/meditacion_guiada_standard/meditacion_guiada_standard.m4a"
    }
  ];

  const handlePlay = (src: string) => {
    if (currentAudio === src && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    } else {
      setCurrentAudio(src);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, 50);
    }
  };

  const closeAudioModal = () => {
    setIsAudioModalOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAudio(null);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...accessCode];
    newCode[index] = value;
    setAccessCode(newCode);
    
    if (value && index < 3) {
      const el = document.getElementById(`code-input-${index + 1}`);
      el?.focus();
    }
  };

  const handleCodeSubmit = () => {
    const code = accessCode.join("");
    if (code.length === 4) {
      if (code === "1234" || code === "0000") { // Códigos de prueba
        setHasAccess(true);
        setIsCodeModalOpen(false);
        setAccessCode(["", "", "", ""]);
        
        if (pendingAction === "emocional") {
          setSelectedBreathingInfographic({ id: 'gestion_emocional', src: '/images/gestion-emocional.pdf' });
        } else if (pendingAction === "reservado") {
          alert("Acceso a contenido reservado concedido. (Área exclusiva en desarrollo)");
        }
        setPendingAction(null);
      } else {
        alert("Código incorrecto. Por favor, inténtelo de nuevo.");
        setAccessCode(["", "", "", ""]);
      }
    }
  };

  return (
    <div className="flex-1 bg-transparent text-on-surface w-full font-body relative">
      <SEO
        title="Herramientas para calmar la ansiedad y el estrés | SoyBienestar"
        description="Respiración, meditación personalizada, recursos de regulación y primeros pasos para bajar activación y recuperar foco."
        canonicalPath="/herramientas"
        noIndex={false}
      />
      <StructuredData id="breadcrumb-schema-herramientas" data={breadcrumbSchema} />
      <StructuredData id="resources-service-schema" data={resourcesServiceSchema} />
      <main className="pt-8 md:pt-16 pb-24 max-w-screen-xl mx-auto px-6 lg:px-8">
        {/* Hidden SEO H1 */}
        <h1 className="sr-only">Herramientas para calmar la ansiedad, el estrés y la mente</h1>
        
        {/* Hero Header Section */}
        <header className="mb-16 md:mb-20 mt-6 md:mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <p className="text-primary tracking-[0.2em] uppercase text-xs font-bold mb-4">Recursos de Claridad</p>
              <h2 className="font-headline text-5xl md:text-7xl text-primary leading-tight mb-8">
                El Refugio de la <span className="italic font-normal">Consciencia</span>
              </h2>
              <div className="h-px w-24 bg-primary/20"></div>
            </div>
            <div className="lg:col-span-5 lg:pt-10">
              <p className="text-on-surface-variant text-lg md:text-xl font-light leading-relaxed">
                Una colección repleta de herramientas diseñadas para calmar las emociones y estructurar el pensamiento. Cada módulo es un paso hacia tu bienestar interior.
              </p>
            </div>
          </div>
        </header>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Meditaciones (Main Feature) */}
          <div className="md:col-span-8 group cursor-pointer" onClick={() => setIsAudioModalOpen(true)}>
            <div className="relative overflow-hidden aspect-[16/9] rounded-2xl">
              <img alt="Meditaciones" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfN1KLjNEUOuARrTiE7gXulSa9Kc3gDaoiuciEFyr9W2a2_vYGBl8MG8tY0s7NgLQ8xtzmawsAH9-hz3-ZTChJ97u8oha7ei3ykxWndbZKwosHDSelxiIrmN9vGCvmMK-UwZ1kCVR22_QRFrsJO2TLPdbs4uxvgTox_9DNIKo-ItEJsjYcpAv2yl_YKLHRM_YVlg3k5YXe9hfkwmB0BaZendMwKPT55nl-F21yDkQbMQxepdQO4CwNKVJEqaCp9WcBLIUMmUhPJz0j" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#162839]/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-10 text-white">
                <h2 className="font-headline text-4xl mb-2 text-white">Meditaciones</h2>
                <p className="text-white/80 font-light tracking-wide max-w-md">Guías sonoras para navegar el silencio y encontrar el centro gravitacional de su ser.</p>
              </div>
            </div>
          </div>

          {/* Diario de Gratitud */}
          <div 
             className="md:col-span-4 group cursor-pointer flex flex-col h-full" 
            onClick={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                navigate('/emotion-diary');
              } else {
                toggleMobileText('gratitude');
              }
            }}
            onDoubleClick={() => navigate('/emotion-diary')}
            onPointerDown={() => handlePointerDown('gratitude')}
            onPointerUp={() => handlePointerUp('gratitude')}
            onPointerLeave={() => {
              handlePointerUp('gratitude');
              if (window.matchMedia('(hover: hover)').matches) {
                setShowGratitudeText(false);
              }
            }}
            onContextMenu={(e) => {
               if (window.matchMedia('(hover: none)').matches) e.preventDefault();
            }}
          >
            <div className="relative overflow-hidden rounded-2xl flex-1 flex flex-col min-h-[420px] sm:min-h-[480px] md:min-h-0 md:aspect-auto">
              <img alt="Diario de Gratitud" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 md:group-hover:scale-105" src="/images/fondo_diario.jpg" />
              
              <div className="relative z-10 flex flex-col justify-end p-6 md:p-8 h-full pointer-events-none text-center">
                <div className={`w-full transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 ${showGratitudeText ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-white bg-black/40 backdrop-blur-md px-6 py-5 border border-white/10 rounded-2xl shadow-xl font-light text-base md:text-lg inline-block w-full break-words">Tu espacio para anclar lo positivo y reconocer la abundancia en lo sutil.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer Row with Text (Editorial feel) */}
          <div className="hidden md:block md:col-span-3"></div>
          <div className="md:col-span-9 pt-6 pb-12">
            <blockquote className="font-headline text-3xl text-primary italic leading-relaxed border-l-4 border-primary/10 pl-12">
              "La arquitectura del bienestar no es un destino, sino el diseño consciente de cada espacio mental que habitamos."
            </blockquote>
          </div>

          {/* Metas Semanales */}
          <div 
             className="md:col-span-5 group cursor-pointer" 
            onClick={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                navigate('/weekly-goals');
              } else {
                toggleMobileText('goals');
              }
            }}
            onDoubleClick={() => navigate('/weekly-goals')}
            onPointerDown={() => handlePointerDown('goals')}
            onPointerUp={() => handlePointerUp('goals')}
            onPointerLeave={() => {
              handlePointerUp('goals');
              if (window.matchMedia('(hover: hover)').matches) {
                setShowGoalsText(false);
              }
            }}
            onContextMenu={(e) => {
               if (window.matchMedia('(hover: none)').matches) e.preventDefault();
            }}
          >
            <div className="relative overflow-hidden h-full rounded-2xl border border-outline-variant/10 flex flex-col justify-between p-12 hover:shadow-lg transition-shadow duration-500">
              <img alt="Metas Semanales" className="dynamic-color-img absolute inset-0 w-full h-full object-cover transition-all duration-1000 grayscale contrast-110 md:group-hover:scale-105 md:group-hover:grayscale-0 md:group-hover:contrast-100 active:grayscale-0 active:contrast-100" src="/images/fondo_propositos.jpg" />
              <div className="absolute inset-0 bg-primary/40 mix-blend-multiply transition-opacity duration-1000 md:group-hover:opacity-60"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                <div>
                  <span className="material-symbols-outlined text-white text-4xl drop-shadow-md">architecture</span>
                </div>
                
                <div className="flex flex-col gap-6 mt-12">
                  <div className={`w-full transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 ${showGoalsText ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-white bg-black/40 backdrop-blur-md px-6 py-4 border border-white/10 rounded-2xl shadow-xl font-light text-base md:text-lg inline-block">Estructurar tus intenciones es el primer paso para hacerlas realidad. Define objetivos que respiran y evolucionan contigo.</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white font-semibold tracking-widest text-xs uppercase group-hover:scale-105 transition-transform origin-left drop-shadow-md">
                    <span>Configurar tablero</span>
                    <span className="material-symbols-outlined text-sm text-white">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Técnicas de Respiración */}
          <div 
             className="md:col-span-7 group cursor-pointer" 
            onClick={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                setIsBreathingModalOpen(true);
              } else {
                toggleMobileText('breathing');
              }
            }}
            onDoubleClick={() => setIsBreathingModalOpen(true)}
            onPointerDown={() => handlePointerDown('breathing')}
            onPointerUp={() => handlePointerUp('breathing')}
            onPointerLeave={() => {
              handlePointerUp('breathing');
              if (window.matchMedia('(hover: hover)').matches) {
                setShowBreathingText(false);
              }
            }}
            onContextMenu={(e) => {
               if (window.matchMedia('(hover: none)').matches) e.preventDefault();
            }}
          >
            <div className="relative overflow-hidden aspect-[16/10] rounded-2xl border border-outline-variant/10">
              <img alt="Respiración" className="dynamic-color-img w-full h-full object-cover transition-all duration-1000 grayscale contrast-110 md:group-hover:scale-105 md:group-hover:grayscale-0 md:group-hover:contrast-100 active:grayscale-0 active:contrast-100" src="/images/fondo-respira.jpg" />
              <div className="absolute inset-0 bg-primary/40 mix-blend-multiply transition-opacity duration-1000 md:group-hover:opacity-60"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-center pointer-events-none">
                <div className={`w-full mb-6 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 ${showBreathingText ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-white bg-black/40 backdrop-blur-md px-6 py-4 border border-white/10 rounded-2xl shadow-xl font-light text-xl md:text-2xl inline-block max-w-lg">El ritmo de los pulmones es la base de toda estructura mental sólida.</p>
                </div>
                <div className="w-full">
                  <h2 className="font-headline text-4xl text-white">Técnicas de Respiración</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Gestión Emocional (Full Width) */}
          <div 
            className="md:col-span-12 mt-12 group cursor-pointer"
            onClick={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                setSelectedBreathingInfographic({ id: 'gestion_emocional', src: '/images/info-terapia-cognitiva.jpg' });
              } else {
                toggleMobileText('gestion');
              }
            }}
            onDoubleClick={() => {
              setSelectedBreathingInfographic({ id: 'gestion_emocional', src: '/images/info-terapia-cognitiva.jpg' });
            }}
            onPointerDown={() => handlePointerDown('gestion')}
            onPointerUp={() => handlePointerUp('gestion')}
            onPointerLeave={() => {
              handlePointerUp('gestion');
              if (window.matchMedia('(hover: hover)').matches) {
                setShowGestionsTextBg(false);
              }
            }}
            onContextMenu={(e) => {
               if (window.matchMedia('(hover: none)').matches) e.preventDefault();
            }}
          >
            <div className="relative w-full min-h-[520px] md:min-h-[460px] lg:min-h-[440px] aspect-auto md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
              <img alt="Gestión Emocional" className="dynamic-color-img absolute inset-0 w-full h-full object-cover grayscale contrast-110 opacity-90 transition-all duration-1000 md:group-hover:grayscale-0 md:group-hover:contrast-100 md:group-hover:opacity-100 active:grayscale-0 active:contrast-100 active:opacity-100 z-0" src="/images/fondo-gestion-emocional.jpg" />
              <div className="relative z-10 flex w-full h-full min-h-[520px] md:min-h-[460px] lg:min-h-[440px]">
                <div className="hidden md:block md:w-2/5 lg:w-[45%]"></div>
                <div className={`w-full md:w-3/5 lg:w-[55%] p-10 md:p-10 lg:p-12 flex flex-col justify-center ml-auto h-full transition-all duration-500 ${showGestionsTextBg ? 'bg-surface-container-lowest/80 backdrop-blur-md border-l border-white/20 shadow-xl' : 'bg-transparent border-transparent shadow-none'} md:bg-transparent md:backdrop-blur-none md:border-transparent md:shadow-none md:group-hover:bg-surface-container-lowest/80 md:group-hover:backdrop-blur-md md:group-hover:border-white/20 md:group-hover:shadow-xl`}>
                  <div className={`transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 ${showGestionsTextBg ? 'opacity-100' : 'opacity-0'}`}>
                    <h2 className="font-headline text-4xl md:text-5xl text-primary mb-5 md:mb-6 leading-tight flex items-center justify-between relative z-20">
                      <span>Gestión <br/><span className="italic">Emocional</span></span>
                      <span className="material-symbols-outlined opacity-50 md:group-hover:opacity-100 transition-opacity !text-[#162839] text-3xl">
                        open_in_new
                      </span>
                    </h2>
                    <p className="text-on-surface-variant text-lg font-light leading-relaxed mb-4 md:mb-5 md:max-w-md lg:max-w-lg relative z-20">
                        Aprende a observar las mareas internas sin ser arrastrado por ellas. Un sistema de herramientas para comprender lo que sientes, ordenar tus pensamientos y no estar controlado por tus emociones.
                    </p>
                    <ul className="text-on-surface-variant text-sm font-light leading-relaxed mb-5 md:mb-6 md:max-w-md lg:max-w-lg space-y-2 md:space-y-3 relative z-20">
                      <li><span style={{fontSize: '12px', letterSpacing: '0.6px', textTransform: 'uppercase'}} className="text-primary tracking-wide font-bold">guia de módulos y método</span></li>
                      <li><span style={{fontSize: '12px', letterSpacing: '0.6px', textTransform: 'uppercase'}} className="text-primary/80 font-medium">Los módulos y método están reservados para miembros que han realizado o están realizando nuestro programa</span></li>
                    </ul>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      if (hasAccess) {
                        setSelectedBreathingInfographic({ id: 'gestion_emocional', src: '/images/gestion-emocional.pdf' });
                      } else {
                        setPendingAction("emocional");
                        setIsCodeModalOpen(true);
                      }
                    }} className="flex items-center justify-center gap-4 w-fit bg-primary dark:bg-[#1a252f] text-white px-10 py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-secondary dark:hover:bg-[#2c3e50] transition-all relative z-20">
                        Explorar Metodología
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Guías Section: Editorial Layout */}
      <section className="pt-24 pb-16 md:pt-28 md:pb-20 bg-transparent">
        <div className="max-w-screen-2xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative group cursor-pointer" 
                 onClick={() => setIsGrayscaleForceOff(!isGrayscaleForceOff)}
                 onTouchStart={() => setIsGrayscaleForceOff(true)}
            >
              <img alt="Person meditating in calm space" className={`w-full h-[600px] object-cover rounded-2xl transition-all duration-700 shadow-xl ${isGrayscaleForceOff ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} src="/images/chica_meditando.jpg"/>
              <div className="absolute -bottom-8 -right-8 bg-primary-container text-on-primary p-8 rounded-full hidden xl:block max-w-xs shadow-2xl">
                <p className="font-headline italic text-lg text-on-primary-container">"La paz no es la ausencia de ruido, sino la armonía dentro de él."</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl lg:text-5xl font-headline mb-8 text-[#162839] dark:text-white">Guías de relajación progresiva</h2>
            <p className="font-body text-lg leading-relaxed mb-10 text-[#334155] dark:text-white/90">
              Nuestra biblioteca exclusiva ofrece un viaje sensorial a través de paisajes visuales y auditivos diseñados para desarticular la tensión acumulada. Cada guía ha sido curada para ofrecer una experiencia inmersiva que trasciende lo digital.
            </p>
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[#162839] dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-medium uppercase tracking-widest text-xs text-[#162839] dark:text-white/80">Contenido validado por expertos</span>
              </li>
              <li className="flex items-center gap-4 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[#162839] dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-medium uppercase tracking-widest text-xs text-[#162839] dark:text-white/80">Disponible 24/7 en cualquier dispositivo</span>
              </li>
              <li className="flex items-center gap-4 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-[#162839] dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-medium uppercase tracking-widest text-xs text-[#162839] dark:text-white/80">Acceso sólo a miembros del ciclo completo</span>
              </li>
            </ul>
            <button 
              onClick={() => {
                if (hasAccess) {
                  alert("Acceso a contenido reservado concedido. (Área exclusiva en desarrollo)");
                } else {
                  setPendingAction("reservado");
                  setIsCodeModalOpen(true);
                }
              }} 
              className="group flex items-center gap-4 font-bold text-lg hover:opacity-80 transition-opacity text-[#162839] dark:text-white"
            >
              <span className="text-[#162839] dark:text-white">Acceder a contenido reservado</span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2 text-[#162839] dark:text-white">lock_open</span>
            </button>
          </div>
        </div>
      </section>

        {/* Recursos Personalizados Section */}
        <section className="mt-12 md:mt-16 py-20 border-t border-outline-variant/10">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <Link 
                to="/anxiety"
                className="relative block overflow-hidden aspect-[1/1] rounded-2xl group border border-outline-variant/10 cursor-pointer"
              >
                <img alt="Acceso a Gestión de Ansiedad" className="dynamic-color-img w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105 grayscale contrast-110 transition-all group-hover:grayscale-0 group-hover:contrast-100 active:grayscale-0 active:contrast-100" src="/images/fondo_ansiedad.jpg" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply transition-opacity duration-1000 group-hover:opacity-60"></div>
              </Link>
            </div>
            <div className="w-full md:w-1/2 max-w-xl">
              <p className="text-primary tracking-[0.2em] uppercase text-xs font-bold mb-4">Su Camino Único</p>
              <h2 className="font-headline text-4xl text-primary mb-6">Recursos Personalizados</h2>
              <p className="text-on-surface-variant text-lg font-light mb-10 leading-relaxed">
                Accede a herramientas preparadas para acompañar tu proceso, según los pasos que hayas completado y los recursos que vayas desbloqueando en la plataforma.
              </p>
              <button 
                onClick={() => {
                  if (hasAccess) {
                    alert("Acceso a contenido reservado concedido. (Área exclusiva en desarrollo)");
                  } else {
                    setPendingAction("reservado");
                    setIsCodeModalOpen(true);
                  }
                }} 
                className="flex items-center justify-center gap-4 w-fit bg-primary dark:bg-[#1a252f] text-white px-8 py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-secondary dark:hover:bg-[#2c3e50] transition-all"
              >
                {hasAccess ? "Ver Colección" : "Introducir Clave"}
                <span className="material-symbols-outlined text-sm dark:text-white">{hasAccess ? "arrow_forward" : "lock"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Herramienta Estado Actual */}
        <section className="mt-8 md:mt-12 py-12 border-t border-outline-variant/10">
          <div className="max-w-4xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-surface-container-lowest shadow-2xl border border-outline-variant/10 min-h-[400px]">
            <img alt="Estado actual" className="absolute inset-0 w-full h-full object-cover" src="/images/fondo_estado_actual.jpg" />
            <div className="absolute inset-0 bg-black/60 md:bg-black/40 backdrop-blur-sm transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col justify-center h-full min-h-[400px] p-8 md:p-16 text-white w-full">
              
              {estadoPaso === "inicio" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="font-headline text-4xl md:text-5xl text-white mb-6">Estado actual</h3>
                  <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                    Observa cómo te sientes y cuánta energía tienes ahora. Este ejercicio entrena tu capacidad de reconocer tu estado interno con más claridad.
                  </p>
                  <div className="mt-10 text-right">
                    <button 
                      onClick={() => setEstadoPaso("sentimiento")}
                      className="bg-white text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-all shadow-lg"
                    >
                      Iniciar
                    </button>
                  </div>
                </div>
              )}

              {estadoPaso === "sentimiento" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                  <h3 className="font-headline text-3xl md:text-4xl text-white mb-3">¿Cómo te sientes ahora?</h3>
                  <p className="text-white/80 text-sm md:text-base font-light mb-8 max-w-2xl leading-relaxed">
                    0 = Sufrimiento / incomodidad profunda <br/>
                    10 = Bienestar absoluto
                  </p>
                  
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button 
                        key={n}
                        onClick={() => handleSentimientoSelect(n)}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center font-headline text-xl md:text-2xl transition-all"
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <div className="mt-12 text-right">
                    <button 
                      onClick={resetEstadoActual}
                      className="text-white/60 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors"
                    >
                      Reiniciar
                    </button>
                  </div>
                </div>
              )}

              {estadoPaso === "energia" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                  <h3 className="font-headline text-3xl md:text-4xl text-white mb-3">¿Cuál es tu nivel de energía?</h3>
                  <p className="text-white/80 text-sm md:text-base font-light mb-8 max-w-2xl leading-relaxed">
                    0 = Agotado <br/>
                    10 = A tope / lleno de energía
                  </p>
                  
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button 
                        key={n}
                        onClick={() => handleEnergiaSelect(n)}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center font-headline text-xl md:text-2xl transition-all"
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <div className="mt-12 text-right">
                    <button 
                      onClick={resetEstadoActual}
                      className="text-white/60 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors"
                    >
                      Reiniciar
                    </button>
                  </div>
                </div>
              )}

              {estadoPaso === "resultado" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                  {getResultadoEstado() ? (
                    <>
                      <p className="text-white/70 uppercase tracking-widest text-xs font-bold mb-3 md:mb-4">
                        Sentimiento: {valorSentimiento} | Energía: {valorEnergia}
                      </p>
                      <h3 className="font-headline text-4xl md:text-5xl text-white mb-4 md:mb-6">
                        {getResultadoEstado()?.sintoma}
                      </h3>
                      <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
                        {getResultadoEstado()?.explicacion}
                      </p>
                    </>
                  ) : (
                    <p className="text-white">Error al obtener resultado.</p>
                  )}
                  
                  <div className="mt-10 md:mt-12 text-right">
                    <button 
                      onClick={resetEstadoActual}
                      className="bg-white text-black px-8 py-3 rounded-full hover:bg-white/90 font-bold uppercase tracking-widest text-xs transition-all shadow-lg"
                    >
                      Reiniciar Autoanálisis
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      </main>

      {/* Floating Modal for Meditations */}
      {isAudioModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative border border-outline-variant/10">
            <button 
              onClick={closeAudioModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors z-10"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
            <div className="p-8 pb-6 border-b border-outline-variant/10 bg-surface">
              <h3 className="font-headline text-3xl text-primary mb-2">Meditaciones Guiadas</h3>
              <p className="text-on-surface-variant text-sm">Selecciona una meditación para comenzar tu práctica hoy.</p>
            </div>
            <div className="p-6 space-y-4">
              {meditations.map((meditation) => {
                const isPlaying = currentAudio === meditation.src && audioRef.current && !audioRef.current.paused;
                return (
                  <div key={meditation.id} className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 hover:bg-surface-container transition-colors">
                    <button 
                      onClick={() => handlePlay(meditation.src)}
                      className="w-14 h-14 shrink-0 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-2xl text-white dark:!text-[#162839]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-headline text-lg text-primary truncate border-b border-outline-variant/10 pb-1 mb-1">{meditation.title}</p>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <span className="font-semibold uppercase tracking-wider">{meditation.type}</span>
                        <span>•</span>
                        <span className="opacity-80">{meditation.duration}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Audio Element Hidden */}
            {currentAudio && (
              <div className="p-4 bg-primary/5 pt-2">
                <audio 
                  ref={audioRef} 
                  src={currentAudio} 
                  controls 
                  className="w-full h-10" 
                  onPlay={() => setCurrentAudio(currentAudio)}
                  onEnded={() => setCurrentAudio(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Luxury Access Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0f12]/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-gradient-to-b from-[#1c2834] to-[#121a22] w-full max-w-sm rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#cca969]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCodeModalOpen(false);
                setAccessCode(["", "", "", ""]);
                setPendingAction(null);
              }}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-[100] border border-white/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-white text-lg">close</span>
            </button>
            
            <div className="p-10 text-center relative z-10">
              <div className="w-16 h-16 mx-auto bg-[#cca969]/10 rounded-full flex items-center justify-center mb-6 border border-[#cca969]/20 shadow-[0_0_20px_rgba(204,169,105,0.1)]">
                <span className="material-symbols-outlined text-[#cca969] text-3xl">key</span>
              </div>
              <h3 className="font-headline text-2xl text-white mb-2 italic tracking-wide">Acceso Privado</h3>
              <p className="text-white/50 text-sm font-light mb-8">Introduzca su código de acceso de 4 dígitos proporcionado en consulta.</p>
              
              <div className="flex justify-center gap-3 mb-8">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`code-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={accessCode[index]}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="w-14 h-16 text-center text-2xl font-serif text-[#cca969] bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#cca969]/50 focus:bg-white/10 transition-all shadow-inner"
                  />
                ))}
              </div>

              <button 
                onClick={handleCodeSubmit}
                disabled={accessCode.join("").length !== 4}
                className="w-full bg-gradient-to-r from-[#b39150] to-[#cca969] text-[#121a22] py-4 rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(204,169,105,0.3)] transition-all disabled:opacity-50 disabled:grayscale"
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breathing Exercises Modal */}
      {isBreathingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative border border-outline-variant/10">
            <button 
              onClick={() => setIsBreathingModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors z-10"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
            <div className="p-8 pb-6 border-b border-outline-variant/10 bg-surface">
              <h3 className="font-headline text-3xl text-primary mb-2">Ejercicios de Respiración</h3>
              <p className="text-on-surface-variant text-sm">Selecciona una técnica para ver las instrucciones guiadas paso a paso.</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { id: '1', title: 'Respiración Cuadrada', type: 'ENFOQUE' },
                { id: '2', title: 'Respiración 4-7-8', type: 'CALMA' },
                { id: '3', title: 'Respiración Abdominal', type: 'PROFUNDA' },
              ].map((technique) => (
                <div 
                  key={technique.id} 
                  onClick={() => {
                    setIsBreathingModalOpen(false);
                    const imageMap: Record<string, string> = {
                      '1': '/images/info-resp-cuadrada.jpg',
                      '2': '/images/info-resp-478.jpg',
                      '3': '/images/info-resp-abdominal.jpg'
                    };
                    setSelectedBreathingInfographic({ id: technique.id, src: imageMap[technique.id] });
                  }}
                  className="cursor-pointer bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 hover:bg-surface-container transition-colors group"
                >
                  <div className="w-14 h-14 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shadow-sm">
                    <span className="material-symbols-outlined text-2xl">air</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-lg text-primary truncate border-b border-outline-variant/10 pb-1 mb-1">{technique.title}</p>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                      <span className="font-semibold uppercase tracking-wider">{technique.type}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">arrow_forward</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Organic Animated Infographic Modal for Breathing Techniques */}
      <AnimatePresence>
        {selectedBreathingInfographic && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-white/20 backdrop-blur-sm"
              onClick={() => setSelectedBreathingInfographic(null)}
            />
            
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div 
                layoutId={'card-' + selectedBreathingInfographic.id}
                className="relative w-full max-w-5xl max-h-[90vh] bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col z-50"
              >
                {/* Elegant Action Buttons */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 z-[130]">
                  <a 
                    href={selectedBreathingInfographic.src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur border border-outline-variant/30 hover:bg-surface text-primary flex items-center justify-center transition-all duration-300 shadow-sm group"
                    title="Abrir en pantalla completa / Descargar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:scale-110 transition-transform">open_in_new</span>
                  </a>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBreathingInfographic(null);
                    }}
                    className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur border border-outline-variant/30 hover:bg-surface text-primary flex items-center justify-center transition-all duration-300 shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-2xl font-light group-hover:rotate-90 transition-transform">close</span>
                  </button>
                </div>
                
                {/* Scrollable document area */}
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8 md:p-12 custom-scrollbar">
                  {selectedBreathingInfographic.src.endsWith('.pdf') ? (
                    <motion.iframe 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      src={selectedBreathingInfographic.src} 
                      className="w-full h-[80vh] rounded-2xl relative z-[120] border-none bg-white shadow-sm"
                      title="Documento PDF"
                    />
                  ) : (
                    <motion.img 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      src={selectedBreathingInfographic.src} 
                      alt="Infografía Detalle" 
                      className="w-full h-auto rounded-xl shadow-sm relative z-[120]"
                    />
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

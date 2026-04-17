import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Ensures a clear separation of identity (users) and summarized privacy-safe memory (userProfiles).
 * Uses the same UID for both collections to simplify permissions and security.
 */
export async function getOrMigrateUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const profileRef = doc(db, "userProfiles", uid);
  
  const [userDoc, profileDoc] = await Promise.all([
    getDoc(userRef),
    getDoc(profileRef)
  ]);

  if (!userDoc.exists()) {
    // Initial placeholder if user document doesn't exist yet
    await setDoc(userRef, { hasDoneConsultation: false, createdAt: new Date().toISOString() });
  }

  const userData = userDoc.exists() ? userDoc.data() : { hasDoneConsultation: false };

  // If profile exists, just return it
  if (profileDoc.exists()) {
    return {
      userRef,
      profileRef,
      userData,
      profileData: profileDoc.data()
    };
  }

  // MIGRACIÓN: Si el perfil no existe, pero el usuario sí, intentamos rescatar memoria
  // Primero miramos si tenía un profileId antiguo
  let legacySummary = userData.accumulatedSummary || "";
  let diaryData: any = { totalDaysUsed: 0, recentScores: [] };

  if (userData.profileId) {
    try {
      const legacyProfileRef = doc(db, "userProfiles", userData.profileId);
      const legacyProfileDoc = await getDoc(legacyProfileRef);
      if (legacyProfileDoc.exists()) {
        const lpData = legacyProfileDoc.data();
        legacySummary = lpData.globalUserSummary || legacySummary;
        diaryData = lpData.diaryProfile || diaryData;
      }
    } catch (e) {
      console.warn("Could not fetch legacy profile during migration", e);
    }
  }

  // Creamos el nuevo perfil fijo basado en UID
  const initialProfile = {
    globalUserSummary: legacySummary,
    latestClinicalConclusion: "",
    diaryProfile: diaryData
  };

  await setDoc(profileRef, initialProfile);

  return {
    userRef,
    profileRef,
    userData,
    profileData: initialProfile
  };
}

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  deriveAgentCoarseUserState,
  type AgentCoarseUserState,
} from "../userState";

export async function readAgentCoarseUserState(
  uid: string,
): Promise<AgentCoarseUserState> {
  const userRef = doc(db, "users", uid);
  const profileRef = doc(db, "userProfiles", uid);
  const [userSnap, profileSnap] = await Promise.all([
    getDoc(userRef),
    getDoc(profileRef),
  ]);

  return deriveAgentCoarseUserState(
    (userSnap.exists() ? userSnap.data() : {}) as Record<string, unknown>,
    (profileSnap.exists() ? profileSnap.data() : {}) as Record<string, unknown>,
  );
}

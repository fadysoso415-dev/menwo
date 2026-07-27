import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Match, Bet, User, PublicBetOffer } from '../types';

/**
 * Recursively removes properties with `undefined` values from an object or array,
 * preventing Firestore `setDoc`/`updateDoc` failures.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && Object.prototype.toString.call(data) === '[object Object]') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Real-time Subscription for Matches in Firestore
 */
export function subscribeToMatches(
  onSuccess: (matches: Match[]) => void,
  onError?: (err: unknown) => void
) {
  const matchesRef = collection(db, 'matches');
  return onSnapshot(
    matchesRef,
    (snapshot) => {
      const matches = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Match));
      onSuccess(matches);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'matches');
      if (onError) onError(error);
    }
  );
}

/**
 * Save or Merge a Match in Firestore
 */
export async function saveMatchToFirestore(match: Match) {
  try {
    const matchRef = doc(db, 'matches', match.id);
    await setDoc(matchRef, sanitizeForFirestore(match), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `matches/${match.id}`);
  }
}

/**
 * Update specific fields of a Match in Firestore
 */
export async function updateMatchInFirestore(matchId: string, updates: Partial<Match>) {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, sanitizeForFirestore(updates) as Record<string, unknown>);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `matches/${matchId}`);
  }
}

/**
 * Seed Initial Matches to Firestore if database collection is empty
 */
export async function seedMatchesIfEmpty(initialMatches: Match[]) {
  try {
    const snapshot = await getDocs(collection(db, 'matches'));
    if (snapshot.empty && initialMatches.length > 0) {
      const batch = writeBatch(db);
      initialMatches.forEach(m => {
        const ref = doc(db, 'matches', m.id);
        batch.set(ref, sanitizeForFirestore(m));
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn("Could not seed matches to Firestore:", error);
  }
}

/**
 * Real-time Subscription for Bets in Firestore
 */
export function subscribeToBets(
  onSuccess: (bets: Bet[]) => void,
  onError?: (err: unknown) => void
) {
  const betsRef = collection(db, 'bets');
  return onSnapshot(
    betsRef,
    (snapshot) => {
      const bets = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Bet));
      bets.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
      onSuccess(bets);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'bets');
      if (onError) onError(error);
    }
  );
}

/**
 * Save a new Bet to Firestore
 */
export async function saveBetToFirestore(bet: Bet) {
  try {
    const betRef = doc(db, 'bets', bet.id);
    await setDoc(betRef, sanitizeForFirestore(bet));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `bets/${bet.id}`);
  }
}

/**
 * Update specific fields of a Bet in Firestore
 */
export async function updateBetInFirestore(betId: string, updates: Partial<Bet>) {
  try {
    const betRef = doc(db, 'bets', betId);
    await updateDoc(betRef, sanitizeForFirestore(updates) as Record<string, unknown>);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `bets/${betId}`);
  }
}

/**
 * Delete a Bet from Firestore
 */
export async function deleteBetFromFirestore(betId: string) {
  try {
    const betRef = doc(db, 'bets', betId);
    await deleteDoc(betRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bets/${betId}`);
  }
}

/**
 * Seed Initial Bets to Firestore if database collection is empty
 */
export async function seedBetsIfEmpty(initialBets: Bet[]) {
  try {
    const snapshot = await getDocs(collection(db, 'bets'));
    if (snapshot.empty && initialBets.length > 0) {
      const batch = writeBatch(db);
      initialBets.forEach(b => {
        const ref = doc(db, 'bets', b.id);
        batch.set(ref, sanitizeForFirestore(b));
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn("Could not seed bets to Firestore:", error);
  }
}

/**
 * User Profile & Balance Sync in Firestore
 */
export async function saveUserToFirestore(user: User) {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, sanitizeForFirestore(user), { merge: true });
  } catch (error) {
    console.warn("User save warning:", error);
  }
}

export function subscribeToUsers(onSuccess: (users: User[]) => void) {
  const usersRef = collection(db, 'users');
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
      onSuccess(users);
    },
    (error) => {
      console.warn("Users subscription notice:", error);
    }
  );
}

/**
 * Public Bet Offers Sync in Firestore
 */
export function subscribeToPublicBets(onSuccess: (offers: PublicBetOffer[]) => void) {
  const ref = collection(db, 'publicBetOffers');
  return onSnapshot(
    ref,
    (snapshot) => {
      const offers = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PublicBetOffer));
      onSuccess(offers);
    },
    (error) => {
      console.warn("Public bets subscription notice:", error);
    }
  );
}

export async function savePublicBetToFirestore(offer: PublicBetOffer) {
  try {
    const ref = doc(db, 'publicBetOffers', offer.id);
    await setDoc(ref, sanitizeForFirestore(offer), { merge: true });
  } catch (error) {
    console.warn("Public bet save warning:", error);
  }
}

export async function deletePublicBetFromFirestore(offerId: string) {
  try {
    const ref = doc(db, 'publicBetOffers', offerId);
    await deleteDoc(ref);
  } catch (error) {
    console.warn("Public bet delete warning:", error);
  }
}

import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import { db } from "../lib/firestore";
import { doc, setDoc, getDoc } from "firebase/firestore";

describe("Firebase Firestore connectivity", () => {
  const testDocRef = doc(db, "testCollection", "testDoc");

  it("should write and read a document", async () => {
    await setDoc(testDocRef, { hello: "world" });
    const snapshot = await getDoc(testDocRef);
    expect(snapshot.exists()).toBe(true);
    expect(snapshot.data()).toEqual({ hello: "world" });
  });
});

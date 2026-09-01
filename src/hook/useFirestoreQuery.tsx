import { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  type WhereFilterOp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../firebaseConfig"; 

type FirestoreData<T> = {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

type Constraint<T> =
  | {
      type: "where";
      field: keyof T | string;
      op: WhereFilterOp;
      value: any;
    }
  | { type: "orderBy"; field: keyof T | string; direction?: "asc" | "desc" }
  | { type: "limit"; value: number };

export function useFirestoreQuery<T>(
  collectionName: string,
  constraints: Constraint<T>[] = [],
  enable = true,
): FirestoreData<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const constraintsStringfy = JSON.stringify(constraints);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const constraintFns: QueryConstraint[] = [];

      constraints.forEach((c) => {
        if (c.type === "where" && c.value !== undefined) {
          constraintFns.push(where(c.field as string, c.op, c.value));
        }
        if (c.type === "orderBy") {
          constraintFns.push(orderBy(c.field as string, c.direction));
        }
        if (c.type === "limit") {
          constraintFns.push(limit(c.value));
        }
      });

      const q = query(collection(db, collectionName), ...constraintFns);

      const querySnapshot = await getDocs(q);
      const docsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setData(docsData);
    } catch (err) {
      setError(err as Error);
      console.error("Erro na busca de dados:", err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, constraintsStringfy]);

  useEffect(() => {
    if (enable) {
      fetchData();
    }
  }, [collectionName, constraintsStringfy, enable, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
const DB_KEY = 'challenges-db';
export interface Challenger {
  name: string;
  reps: number;
}

export interface Challenge {
  date: string;
  goal: number;
  challengers: Challenger[];
  excercise: string;
  startedAt?: string;
}
const fetchChallenge = async (date: Date) => {
  if (!date) {
    return {
      error: 'Invalid data',
      data: null,
    };
  }
  const db = getDb();

  const challengeKey = date.toISOString().split('T')[0];
  const challenge = db[challengeKey];

  if (challenge) {
    return {
      data: challenge,
      error: null,
    };
  }
  // create new challenge if not found
  const newChallenge = {
    date: date.toISOString().split('T')[0],
    goal: 100,
    challengers: [],
    excercise: '',
    startedAt: new Date().toISOString(),
  };

  db[challengeKey] = newChallenge;

  updateDb(db);
  return {
    data: newChallenge,
    error: null,
  };
};

const fetchAllChallenges = async () => {
  console.log('fetching all challenges');
  const db = getDb();
  return Object.values(db) as Challenge[] | [];
};

const updateChallenge = async (date: Date, update: Challenge) => {
  if (!date || !update) {
    return {
      error: 'Invalid data',
      data: null,
    };
  }
  const challengeKey = date.toISOString().split('T')[0];
  const database = getDb();

  const foundChallenge = database[challengeKey];

  if (foundChallenge) {
    const updatedChallenge = { ...foundChallenge, ...update };
    database[challengeKey] = updatedChallenge;
  }

  updateDb(database);

  return {
    data: update,
    error: null,
  };
};

const addChallenger = async (date: Date, challenger: Challenger) => {
  // validation
  if (!challenger.name || !date) {
    return {
      error: 'Invalid data',
      data: null,
    };
  }

  // parse key from date
  const challengeKey = date.toISOString().split('T')[0];

  const database = getDb();
  // find challenge by key
  const foundChallenge = database[challengeKey];

  if (!foundChallenge) {
    return {
      error: 'Challenge not found',
      data: null,
    };
  }

  // check if challenger already exists
  if (foundChallenge.challengers.find((c) => c.name === challenger.name)) {
    return {
      error: 'Challenger already exists',
      data: null,
    };
  }

  // add challenger to challenge
  const updatedChallenge = {
    ...foundChallenge,
    challengers: [...foundChallenge.challengers, challenger],
  };

  // update challenge in database
  database[challengeKey] = updatedChallenge;

  // save changes
  updateDb(database);

  return {
    data: updatedChallenge,
    error: null,
  };
};

const removeChallenger = async (date: Date, challengerName: string) => {
  // validation
  if (!challengerName || !date) {
    return {
      error: 'Invalid data',
      data: null,
    };
  }

  // parse key from date
  const challengeKey = date.toISOString().split('T')[0];
  const database = getDb();

  // find challenge by key
  const foundChallenge = database[challengeKey];

  if (!foundChallenge) {
    return {
      error: 'Challenge not found',
      data: null,
    };
  }

  // remove challenger from challenge
  const updatedChallenge = {
    ...foundChallenge,
    challengers: foundChallenge.challengers.filter(
      (c) => c.name !== challengerName
    ),
  };

  // update challenge in database
  database[challengeKey] = updatedChallenge;

  // save changes
  updateDb(database);

  return {
    data: updatedChallenge,
    error: null,
  };
};

const updateReps = async (date: Date, challengerName: string, reps: number) => {
  // validation
  if (!challengerName || !date) {
    return {
      error: 'Invalid data',
      data: null,
    };
  }

  // parse key from date
  const challengeKey = date.toISOString().split('T')[0];
  const database = getDb();

  // find challenge by key
  const foundChallenge = database[challengeKey];

  if (!foundChallenge) {
    return {
      error: 'Challenge not found',
      data: null,
    };
  }

  // find challenger by name
  const challenger = foundChallenge.challengers.find(
    (c) => c.name === challengerName
  );

  if (!challenger) {
    return {
      error: 'Challenger not found',
      data: null,
    };
  }

  const updatedChallenger = {
    ...challenger,
    reps: Math.max(0, challenger.reps + reps),
  };
  database[challengeKey] = {
    ...foundChallenge,
    challengers: foundChallenge.challengers.map((c) =>
      c.name === challengerName ? updatedChallenger : c
    ),
  };

  updateDb(database);

  return {
    data: updatedChallenger,
    error: null,
  };
};

const getDb = (): Record<string, Challenge | null> => {
  const dbString = localStorage.getItem(DB_KEY);
  return dbString
    ? JSON.parse(dbString)
    : ({} as Record<string, Challenge | null>);
};

const updateDb = (db: Record<string, Challenge | null>) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const useGetChallenge = (date: Date) => {
  return useSuspenseQuery({
    queryKey: ['challenges'],
    queryFn: () => fetchChallenge(date),
  });
};

const useGetAllChallenges = () => {
  return useSuspenseQuery({
    queryKey: ['challenges'],
    queryFn: fetchAllChallenges,
    initialData: [],
  });
};

// Mutation to update the challenge and store it in localStorage
const useUpdateChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      challenge,
      date,
    }: {
      challenge: Challenge;
      date: Date;
    }) => {
      return updateChallenge(date, challenge);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenges'],
      });
    },
  });
};

// Mutation to add a challenger to a challenge
const useAddChallenger = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: Date; challenger: Challenger }) => {
      return addChallenger(data.date, data.challenger);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenges'],
      });
    },
  });
};

// Mutation to remove a challenger from a challenge
const useRemoveChallenger = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: Date; name: string }) => {
      return removeChallenger(data.date, data.name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenges'],
      });
    },
  });
};

// Mutation to update the reps of a challenger
const useUpdateReps = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: Date; name: string; reps: number }) => {
      return updateReps(data.date, data.name, data.reps);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenges'],
      });
    },
  });
};

const useSetChallengeGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: Date; goal: number }) => {
      const response = await fetchChallenge(data.date);
      if (!response.data) {
        return { error: 'Challenge not found' };
      }
      response.data.goal = data.goal;
      return updateChallenge(data.date, response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenges'],
      });
    },
  });
};

const useUpdateChallengeExcercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: Date; excercise: string }) => {
      const response = await fetchChallenge(data.date);
      if (!response.data) {
        return { error: 'Challenge not found' };
      }
      response.data.excercise = data.excercise;
      return updateChallenge(data.date, response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['challenges'],
      });
    },
  });
};

export {
  useGetChallenge,
  useGetAllChallenges,
  useUpdateChallenge,
  useAddChallenger,
  useRemoveChallenger,
  useUpdateReps,
  useSetChallengeGoal,
  useUpdateChallengeExcercise,
};

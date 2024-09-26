'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Challenger {
  name: string;
  reps: number;
}

interface Challenge {
  date: string;
  goal: number;
  challengers: Challenger[];
  excercise: string;
  startedAt?: string;
}

export default function ExerciseRepTracker() {
  const [challenge, setChallenge] = useState<Challenge>(
    JSON.parse(
      localStorage.getItem(new Date().toISOString().split('T')[0]) || 'null'
    ) || {
      date: new Date().toISOString().split('T')[0],
      goal: 100,
      challengers: [],
      excercise: '',
      startedAt: new Date().toISOString(),
    }
  );
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  // store challenge in local storage
  useEffect(() => {
    const storedChallenge = localStorage.getItem(challenge.date);
    if (storedChallenge) {
      localStorage.setItem(
        challenge.date,
        JSON.stringify({ ...JSON.parse(storedChallenge), ...challenge })
      );
    }
    localStorage.setItem(challenge.date, JSON.stringify(challenge));
  }, [challenge]);
  // useEffect(() => {
  //   const storedChallenge = localStorage.getItem(challenge.date);
  //   if (storedChallenge) {
  //     setChallenge(JSON.parse(storedChallenge));
  //   }
  //   loadAllChallenges();
  // }, [challenge.date]);

  useEffect(() => {
    // localStorage.setItem(challenge.date, JSON.stringify(challenge));
    loadAllChallenges();
  }, [challenge]);

  const loadAllChallenges = () => {
    const challenges: Challenge[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const storedChallenge = localStorage.getItem(key);
        if (storedChallenge) {
          challenges.push(JSON.parse(storedChallenge));
        }
      }
    }
    setAllChallenges(
      challenges.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  const setGoal = (goal: number) => {
    setChallenge((prev) => ({ ...prev, goal }));
    // update local storage
    const storedChallenge = localStorage.getItem(challenge.date);
    if (storedChallenge) {
      localStorage.setItem(
        challenge.date,
        JSON.stringify({ ...JSON.parse(storedChallenge), goal })
      );
    }
  };

  const addChallenger = (name: string) => {
    if (name && !challenge.challengers.some((c) => c.name === name)) {
      setChallenge((prev) => ({
        ...prev,
        challengers: [...prev.challengers, { name, reps: 0 }],
      }));
    }

    // update local storage
    const storedChallenge = localStorage.getItem(challenge.date);
    if (storedChallenge) {
      localStorage.setItem(
        challenge.date,
        JSON.stringify({
          ...JSON.parse(storedChallenge),
          challengers: [
            ...JSON.parse(storedChallenge).challengers,
            { name, reps: 0 },
          ],
        })
      );
    }
    const input = document.getElementById('newChallenger') as HTMLInputElement;
    input.value = '';
    input.focus();
  };

  const removeChallenger = (name: string) => {
    setChallenge((prev) => ({
      ...prev,
      challengers: prev.challengers.filter((c) => c.name !== name),
    }));

    // update local storage
    const storedChallenge = localStorage.getItem(challenge.date);
    if (storedChallenge) {
      localStorage.setItem(
        challenge.date,
        JSON.stringify({
          ...JSON.parse(storedChallenge),
          challengers: JSON.parse(storedChallenge).challengers.filter(
            (c: Challenger) => c.name !== name
          ),
        })
      );
    }
  };

  const updateReps = (name: string, change: number) => {
    setChallenge((prev) => ({
      ...prev,
      challengers: prev.challengers.map((c) =>
        c.name === name ? { ...c, reps: Math.max(0, c.reps + change) } : c
      ),
    }));

    // update local storage
    const storedChallenge = localStorage.getItem(challenge.date);
    if (storedChallenge) {
      localStorage.setItem(
        challenge.date,
        JSON.stringify({
          ...JSON.parse(storedChallenge),
          challengers: JSON.parse(storedChallenge).challengers.map(
            (c: Challenger) =>
              c.name === name ? { ...c, reps: Math.max(0, c.reps + change) } : c
          ),
        })
      );
    }
  };

  const updateChallengeExcercise = (excercise: string) => {
    setChallenge((prev) => ({ ...prev, excercise }));
    // update local storage
    const storedChallenge = localStorage.getItem(challenge.date);
    if (storedChallenge) {
      localStorage.setItem(
        challenge.date,
        JSON.stringify({ ...JSON.parse(storedChallenge), excercise })
      );
    }
  };

  const currentChallengeTotalReps = challenge.challengers.reduce(
    (sum, c) => sum + c.reps,
    0
  );

  return (
    <div className='w-full max-w-2xl mx-auto space-y-6 group/parent'>
      <Card>
        <CardHeader>
          <CardTitle>Exercise Rep Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='excercise'
                className='block text-sm font-medium text-gray-700'
              >
                Excercise
              </label>
              <Input
                type='text'
                list='excercises'
                id='excercise'
                value={challenge.excercise}
                onChange={(e) => updateChallengeExcercise(e.target.value)}
                className='mt-1'
              />
              <datalist id='excercises'>
                <option value='Pushups' />
                <option value='Situps' />
                <option value='Squats' />
                <option value='Pullups' />
                <option value='Planks' />
                <option value='Lunges' />
                <option value='Burpees' />
                <option value='Jumping Jacks' />
              </datalist>
            </div>
            <div>
              <label
                htmlFor='goal'
                className='block text-sm font-medium text-gray-700'
              >
                Goal
              </label>
              <Input
                type='number'
                id='goal'
                value={challenge.goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className='mt-1'
              />
            </div>
            <div>
              <label
                htmlFor='newChallenger'
                className='block text-sm font-medium text-gray-700'
              >
                Add Challenger
              </label>
              <div className='flex mt-1'>
                <Input
                  type='text'
                  id='newChallenger'
                  placeholder='Challenger name'
                  onKeyUp={(e) => {
                    if (!e.currentTarget.value) return;

                    e.key === 'Enter' && addChallenger(e.currentTarget.value);
                  }}
                />
                <Button
                  onClick={() => {
                    const input = document.getElementById(
                      'newChallenger'
                    ) as HTMLInputElement;
                    addChallenger(input.value);
                    input.value = '';
                  }}
                  className='ml-2'
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
            </div>
            <div className='space-y-2'>
              {challenge.challengers.map((challenger) => (
                <div
                  key={challenger.name}
                  className='flex items-center justify-between '
                >
                  <div className='group'>
                    <span className='group-hover:pl-8 transition-all relative'>
                      <div
                        title={`Remove ${challenger.name}`}
                        onClick={() => removeChallenger(challenger.name)}
                        className='bg-destructive/10 border border-destructive/20 rounded-md cursor-pointer hover-visible hover:opacity-100 hover:scale-100 hover:translate-x-0 group-hover:visible group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all transform translate-x-4 scale-0 opacity-0 absolute left-0'
                      >
                        <Minus className='h-4 w-4' />
                      </div>
                      {challenger.name}{' '}
                      {challenger.reps < challenge.goal ? '🐈' : '🐕'}
                    </span>
                  </div>
                  {/* calculate how percentage of goal completed by the user */}
                  <span>
                    {Math.round((challenger.reps / challenge.goal) * 100)}% or{' '}
                    {challenger.reps}/{challenge.goal} reps
                  </span>
                  <div className='flex items-center space-x-2'>
                    <Button
                      onClick={() => updateReps(challenger.name, -5)}
                      size='sm'
                      variant='outline'
                    >
                      <Minus className='h-4 w-4' />
                    </Button>
                    <span
                      className='w-8 text-center'
                      contentEditable
                      onBlur={(e) =>
                        updateReps(
                          challenger.name,
                          Number(e.currentTarget.textContent) - challenger.reps
                        )
                      }
                      // select all text on focus
                      onFocus={(e) => {
                        const range = document.createRange();
                        range.selectNodeContents(e.currentTarget);
                        const selection = window.getSelection();
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                      }}
                      // prevent new line on enter or non-numeric input
                      onInput={(e) => {
                        e.preventDefault();
                        const text = e.currentTarget.textContent;
                        // cant start with 0
                        if (text && text.startsWith('0')) {
                          e.currentTarget.textContent = text.slice(1);
                        }
                        // only allow numbers
                        if (text && !/^\d+$/.test(text)) {
                          e.currentTarget.textContent = text.replace(/\D/g, '');
                        }

                        // limit to 3 digits
                        if (text && text.length > 3) {
                          e.currentTarget.textContent = text.slice(0, 3);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: challenger.reps }}
                    ></span>
                    <Button
                      onClick={() => updateReps(challenger.name, 5)}
                      size='sm'
                      variant='outline'
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className='text-right'>
              <span className='font-bold'>
                Total: {currentChallengeTotalReps}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Previous Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type='single' collapsible className='w-full'>
            {allChallenges.map((pastChallenge, index) => (
              <AccordionItem value={`item-${index}`} key={pastChallenge.date}>
                <AccordionTrigger>
                  {pastChallenge.date} - Goal: {pastChallenge.goal}
                </AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-2'>
                    {pastChallenge.challengers.map((challenger) => (
                      <div
                        key={challenger.name}
                        className='flex justify-between'
                      >
                        <span>{challenger.name}</span>
                        <span>
                          {challenger.reps} reps out of {pastChallenge.goal}{' '}
                          {challenger.reps >= pastChallenge.goal
                            ? '✅'
                            : 'Wimped Out 🐈'}
                        </span>
                      </div>
                    ))}
                    <div className='text-right font-bold'>
                      Total:{' '}
                      {pastChallenge.challengers.reduce(
                        (sum, c) => sum + c.reps,
                        0
                      )}{' '}
                      {pastChallenge.excercise + "'s completed"}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      {currentChallengeTotalReps >=
        challenge.goal * challenge.challengers.length && (
        <div className='absolute left-0 right-0 top-10 bottom-0 overflow-hidden group-hover/parent:hidden'>
          <div className='firework'></div>
          <div className='firework'></div>
          <div className='firework'></div>
          <div className='firework'></div>
          <div className='firework'></div>
          <div className='firework'></div>
        </div>
      )}
    </div>
  );
}

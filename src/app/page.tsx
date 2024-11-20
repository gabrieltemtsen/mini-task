/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReadContract, useAccount } from 'wagmi';
import { createPublicClient, formatUnits, http } from 'viem';
import { morphHolesky } from 'viem/chains';
import Link from 'next/link';
import { TASK_CONTRACT_ADDRESS, TASK_CONTRACT_ABI } from '@/utils/contracts';
import { shortenText, shortenAddress } from '@/utils/shorten';

const Home = () => {
  const { isConnected } = useAccount();
  const [tasks, setTasks] = useState<any[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  const client = createPublicClient({
    chain: morphHolesky,
    transport: http(),
  });

  const { data: totalTasks }: any = useReadContract({
    address: TASK_CONTRACT_ADDRESS,
    abi: TASK_CONTRACT_ABI,
    functionName: 'taskCounter',
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (totalTasks) {
        const tasksArray = [];
        for (let i = 1; i <= Number(totalTasks); i++) {
          const task: any = await client.readContract({
            address: TASK_CONTRACT_ADDRESS,
            abi: TASK_CONTRACT_ABI,
            functionName: 'tasks',
            args: [i],
          });
          const _task = {
            poster: task[0],
            reward: task[1],
            title: task[2],
            description: task[3],
            active: task[4],
          };
          tasksArray.push(_task);
        }
        setTasks(tasksArray);
      }
    };
    fetchTasks();
  }, [totalTasks]);

  if (!hydrated) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Tasks</h1>
      {isConnected && (
        <Link href="/create">
          <button className="bg-blue-600 text-sm px-4 py-2 mb-6 rounded-lg hover:bg-blue-700 transition-colors">
            Create Task
          </button>
        </Link>
      )}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col justify-between"
            onClick={() => router.push(`/task/${index + 1}`)}
            style={{ minHeight: '220px' }}
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
              <p className="text-sm text-gray-400 mb-4">
                {shortenText(task.description, 60)}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-semibold">{formatUnits(task.reward, 18)} ETH</span>
                {isConnected && (
                  <button className="bg-blue-600 text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                    See Task
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Posted by: {shortenAddress(task.poster)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

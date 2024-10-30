/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // App router way
import { useReadContract, useAccount } from 'wagmi';
import { createPublicClient, formatUnits, http } from 'viem';
import { morphHolesky } from 'viem/chains';
import Link from 'next/link';
import { TASK_CONTRACT_ADDRESS, TASK_CONTRACT_ABI } from '@/utils/contracts';
import { shortenText, shortenAddress } from '@/utils/shorten';

const Home = () => {
  const { isConnected } = useAccount();
  const [tasks, setTasks] = useState<any[]>([]);
  const [hydrated, setHydrated] = useState(false); // Track hydration status
  const router = useRouter(); // Use router from `next/navigation`

  const client = createPublicClient({
    chain: morphHolesky,
    transport: http(),
  });

  const { data: totalTasks }: any = useReadContract({
    address: TASK_CONTRACT_ADDRESS,
    abi: TASK_CONTRACT_ABI,
    functionName: 'taskCounter',
  });

  // Ensure the component is hydrated before rendering dynamic elements
  useEffect(() => {
    setHydrated(true); // Set hydrated to true after the component mounts
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
            reward: task[1], // Assuming reward is in Wei
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

  if (!hydrated) return null; // Prevent rendering until hydration

  return (
    <div className="flex flex-col items-center justify-center min-h-md m-5 p-8 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-white mb-8">Tasks</h1>
      {isConnected && (
        <Link href="/create">
          <button className="bg-blue-500 text-sm text-white px-4 py-2 m-5 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
            Create Task
          </button>
        </Link>
      )}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
            onClick={() => router.push(`/task/${index + 1}`)} // Navigate on click
            style={{ minHeight: '220px' }} // Ensures all cards are the same height
          >
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">{task.title}</h2>
              <p className="text-sm text-gray-600 mb-4">
                {shortenText(task.description, 60)} {/* Shortened description */}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex-1">
                  <span className="text-lg font-semibold text-gray-800">
                    {formatUnits(task.reward, 18)} ETH
                  </span>
                </div>
                {isConnected && (
                  <div className="flex-shrink-0">
                    <button className="bg-blue-500 text-sm text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
                      See Task
                    </button>
                  </div>
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

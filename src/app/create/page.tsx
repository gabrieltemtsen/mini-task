'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWriteContract } from 'wagmi';
import Spinner from '@/components/Spinner';
import { toast } from 'react-toastify';
import { parseEther } from 'viem';
import { TASK_CONTRACT_ABI, TASK_CONTRACT_ADDRESS } from '@/utils/contracts';
import { useRouter } from 'next/navigation';

const CreateTask = () => {
  const { isConnected } = useAccount();
  const [taskName, setTaskName] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { writeContract: createTaskWrite } = useWriteContract();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !taskDescription || !rewardAmount) {
      toast.error('Please enter all task details and the reward amount');
      return;
    }

    setIsLoading(true);
    try {
      // Call the contract to create a task
      const tx = await createTaskWrite({
        address: TASK_CONTRACT_ADDRESS,
        abi: TASK_CONTRACT_ABI,
        functionName: 'postTask',
        args: [taskName, taskDescription],
        value: parseEther(rewardAmount) // Passing the reward amount as value
      }, {
        onSuccess: () => {
          toast.success('Task created successfully!');
          setTaskName(''); // Clear input fields
          setTaskDescription('');
          setRewardAmount('');
          router.push('/');
        }
      });

      console.log('Transaction successful:', tx);

    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Please connect your wallet to create a task.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-900">
      <h1 className="text-4xl font-bold text-white mb-4">Create Task</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="text"
          placeholder="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 bg-gray-800 text-white"
        />
        <textarea
          placeholder="Task Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 bg-gray-800 text-white"
        />
        <input
          type="text"
          placeholder="Reward Amount (in ETH)"
          value={rewardAmount}
          onChange={(e) => setRewardAmount(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 bg-gray-800 text-white"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default CreateTask;

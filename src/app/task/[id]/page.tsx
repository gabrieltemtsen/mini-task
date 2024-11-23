/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { TASK_CONTRACT_ADDRESS, TASK_CONTRACT_ABI } from '@/utils/contracts';
import { pinFileToIPFS } from '@/utils/ipfs';
import { shortenAddress } from '@/utils/shorten';
import Spinner from '@/components/Spinner'; // Import the Spinner component

const Task = () => {
  const [task, setTask] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false); // State for showing spinner
  const [showModal, setShowModal] = useState(false);
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [submissionFile, setSubmissionFile] = useState<any>(null);
  const { address } = useAccount();
  const router = useRouter();
  const { id } = useParams();

  const { data: taskData, isLoading: isTaskLoading }: any = useReadContract({
    address: TASK_CONTRACT_ADDRESS,
    abi: TASK_CONTRACT_ABI,
    functionName: 'tasks',
    args: [id],
  });

  const { data: submissionData, isLoading: isSubmissionsLoading }: any = useReadContract({
    address: TASK_CONTRACT_ADDRESS,
    abi: TASK_CONTRACT_ABI,
    functionName: 'getSubmissions',
    args: [id],
  });

  const { writeContract: submitTaskWrite } = useWriteContract();
  const { writeContract: selectWinnerWrite } = useWriteContract();

  useEffect(() => {
    if (taskData) {
      setTask({
        poster: taskData[0],
        reward: Number(taskData[1]),
        title: taskData[2],
        description: taskData[3],
        active: taskData[4],
      });
    }
    if (submissionData) {
      setSubmissions(
        submissionData.map((submission: any) => ({
          submitter: submission.submitter,
          cid: submission.cid,
          title: submission.title,
          description: submission.description,
        }))
      );
    }
  }, [taskData, submissionData]);

  const handleSubmission = async (e: any) => {
    e.preventDefault();
    if (!submissionTitle || !submissionDescription || !submissionFile) {
      toast.error('Please fill in all fields and upload a file.');
      return;
    }

    setIsLoading(true);
    try {
      const cid = await pinFileToIPFS(submissionFile, submissionFile.name);
      await submitTaskWrite(
        {
          address: TASK_CONTRACT_ADDRESS,
          abi: TASK_CONTRACT_ABI,
          functionName: 'submitTask',
          args: [id, cid, submissionTitle, submissionDescription],
        },
        {
          onSuccess: () => {
            toast.success('Submission created successfully!');
            setSubmissionTitle('');
            setSubmissionDescription('');
            setSubmissionFile(null);
            setShowModal(false);
            router.refresh();
          },
          onError: (error) => {
            console.error(error);
            toast.error('Failed to create submission.');
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWinner = async (submissionIndex: number) => {
    setIsLoading(true);
    try {
      await selectWinnerWrite(
        {
          address: TASK_CONTRACT_ADDRESS,
          abi: TASK_CONTRACT_ABI,
          functionName: 'selectWinner',
          args: [id, submissionIndex],
        },
        {
          onSuccess: () => {
            toast.success('Winner selected successfully!');
            router.refresh();
          },
          onError: (error) => {
            console.error(error);
            toast.error('Failed to select winner.');
          },
        }
      );
    } catch (error) {
      console.error('Failed to select winner:', error);
      toast.error('Failed to select winner.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show spinner if task or submissions are loading
  if (isTaskLoading || isSubmissionsLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg min-h-screen py-2 bg-gray-900 font-mono text-sm text-gray-200">
      {task && (
        <>
          <h1 className="text-3xl font-bold text-white mb-4">{task.title}</h1>
          <p className="text-md text-white mb-4">{task.description}</p>
          <p className="text-lg text-white mb-2">Reward: {task.reward / 1e18} ETH</p>
          <p className="text-md text-gray-400 mb-4">Posted by: {shortenAddress(task.poster)}</p>
          {task.active && address !== task.poster && (
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none mb-8"
              onClick={() => setShowModal(true)}
            >
              Submit Entry
            </button>
          )}
          {!task.active && (
            <button
              className="bg-gray-600 text-white py-2 px-4 rounded-lg shadow-md cursor-not-allowed mb-8"
              disabled
            >
              Task Completed
            </button>
          )}
        </>
      )}

      <h2 className="text-2xl font-bold text-white mb-6">Submissions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {submissions.map((submission: any, index: any) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-between"
            style={{ minHeight: '300px' }}
          >
            <img
              src={`https://beige-lively-guppy-253.mypinata.cloud/ipfs/${submission.cid}`}
              alt={submission.title}
              className="w-full h-48 object-contain"
            />
            <div className="p-4 flex flex-col justify-between flex-grow">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{submission.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{submission.description}</p>
              <p className="text-sm text-gray-500">Submitted by: {shortenAddress(submission.submitter)}</p>
              {address === task?.poster && task.active && (
                <button
                  className="bg-green-600 text-white py-2 px-4 mt-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none"
                  onClick={() => handleSelectWinner(index)}
                >
                  Claim & Select Winner
                </button>
              )}
              {!task.active && (
                <button
                  className="bg-gray-600 text-white py-2 px-4 mt-4 rounded-lg shadow-md cursor-not-allowed"
                  disabled
                >
                  Task Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create a Submission</h2>
            <form onSubmit={handleSubmission}>
              <input
                type="text"
                placeholder="Title"
                value={submissionTitle}
                onChange={(e) => setSubmissionTitle(e.target.value)}
                className="w-full px-4 py-2 mb-4 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-700"
              />
              <textarea
                placeholder="Description"
                value={submissionDescription}
                onChange={(e) => setSubmissionDescription(e.target.value)}
                className="w-full px-4 py-2 mb-4 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-700"
              />
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    setSubmissionFile(e.target.files[0]);
                  }
                }}
                className="w-full px-4 py-2 mb-4 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-700"
              />
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;

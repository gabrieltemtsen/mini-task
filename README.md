# Mini-Tasks

Mini-Tasks is a decentralized application (dApp) built on Morph Holesky Testnet, allowing users to create tasks, submit work, and get rewarded in cryptocurrency. It leverages smart contracts to ensure transparency, fairness, and security in task management and reward distribution.

## Features

- **Task Creation**: Users can post tasks with specific details and a reward in ETH.
- **Submissions**: Anyone can submit their work for a task. Submissions include a title, description, and a file (stored on IPFS).
- **Reward Distribution**: Task creators can review submissions and select a winner, automatically transferring the reward to the winner's address.
- **Blockchain-Powered**: All actions, including task creation, submissions, and reward distribution, are recorded on the Morph Holesky Testnet.
- **IPFS Integration**: Files related to submissions are stored on the InterPlanetary File System (IPFS), ensuring decentralized and immutable storage.

## How It Works

### 1. Task Creation

1. **Connect Wallet**: To create a task, users need to connect their EVM wallet (powere by ReOwn).
2. **Create Task**: Users fill out a form with the task's title, description, and the reward amount in ETH.
3. **Post Task**: Upon submission, the task details are recorded on the chain, and the reward is securely held in the smart contract until a winner is chosen.

### 2. Submitting Work

1. **Browse Tasks**: Anyone can view available tasks on the platform.
2. **Submit Work**: Users can submit their work by filling out a form with a title, description, and file upload. The file is uploaded to IPFS, and the corresponding CID (Content Identifier) is stored on the blockchain.
3. **View Submissions**: Task creators and other users can view all submissions for a task.

### 3. Reward Distribution

1. **Review Submissions**: The task creator reviews the submissions and selects a winner.
2. **Distribute Reward**: The smart contract automatically transfers the reward to the winner's address.

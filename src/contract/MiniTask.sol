// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title MiniTasks - A platform for posting tasks with rewards and selecting winners
/// @notice This contract is designed to handle posting tasks, submitting entries, selecting winners, and task cancellation.
/// @dev Deployed on Morph

contract MiniTasks {
    // Structure to represent a task
    struct Task {
        address poster; // Address of the user who posted the task
        uint256 reward; // Reward amount in ETH for the task
        string title; // Title of the task
        string description; // Description of the task
        bool active; // Status of the task, true if active
    }

    // Structure to represent a submission for a task
    struct Submission {
        address submitter; // Address of the user who submitted the entry
        string cid; // Content Identifier for the image (stored off-chain, e.g., IPFS)
        string title; // Title of the submission
        string description; // Description of the submission
    }

    uint256 public taskCounter; // Counter to keep track of the number of tasks
    uint256 public totalFunds; // Total funds that have passed through the platform
    mapping(uint256 => Task) public tasks; // Mapping of task ID to Task structure
    mapping(uint256 => Submission[]) public submissions; // Mapping of task ID to an array of submissions

    // Events for logging key actions
    event TaskPosted(uint256 taskId, address indexed poster, uint256 reward, string title, string description);
    event TaskCancelled(uint256 taskId, address indexed poster);
    event SubmissionMade(uint256 taskId, address indexed submitter, string cid, string title, string description);
    event WinnerSelected(uint256 taskId, address indexed winner, uint256 reward);

    /// @notice Function to post a new task with a reward
    /// @param _title Title of the task
    /// @param _description Description of the task
    /// @dev The function requires a non-zero reward to be sent with the transaction
    function postTask(string memory _title, string memory _description) external payable {
        require(msg.value > 0, "Reward must be greater than 0"); // Ensure reward is greater than 0

        taskCounter++; // Increment task counter
        tasks[taskCounter] = Task({
            poster: msg.sender,
            reward: msg.value,
            title: _title,
            description: _description,
            active: true
        });

        emit TaskPosted(taskCounter, msg.sender, msg.value, _title, _description); // Emit event for task posting
    }

    /// @notice Function to submit an entry for a task
    /// @param _taskId ID of the task to submit to
    /// @param _cid Content Identifier for the image submission
    /// @param _title Title of the submission
    /// @param _description Description of the submission
    /// @dev The submitter must not be the task poster and the task must be active
    function submitTask(uint256 _taskId, string memory _cid, string memory _title, string memory _description) external {
        require(tasks[_taskId].active, "Task is not active"); // Check if the task is active
        require(msg.sender != tasks[_taskId].poster, "Poster cannot submit"); // Ensure the poster is not submitting

        submissions[_taskId].push(Submission({
            submitter: msg.sender,
            cid: _cid,
            title: _title,
            description: _description
        }));

        emit SubmissionMade(_taskId, msg.sender, _cid, _title, _description); // Emit event for submission
    }

    /// @notice Function to select a winner for a task
    /// @param _taskId ID of the task
    /// @param _submissionIndex Index of the winning submission in the submissions array
    /// @dev Only the task poster can select the winner, and the task must be active
    function selectWinner(uint256 _taskId, uint256 _submissionIndex) external {
        Task storage task = tasks[_taskId];
        require(task.poster == msg.sender, "Only the poster can select the winner"); // Ensure the caller is the poster
        require(task.active, "Task is not active"); // Check if the task is active

        Submission memory winningSubmission = submissions[_taskId][_submissionIndex]; // Get the winning submission
        task.active = false; // Deactivate the task
        payable(winningSubmission.submitter).transfer(task.reward); // Transfer the reward to the winner

        // Update totalFunds to track the reward distributed
        totalFunds += task.reward;

        emit WinnerSelected(_taskId, winningSubmission.submitter, task.reward); // Emit event for winner selection
    }

    /// @notice Function to cancel a task and refund the reward to the poster
    /// @param _taskId ID of the task to cancel
    /// @dev Only the task poster can cancel the task, and the task must be active
    function cancelTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.poster == msg.sender, "Only the poster can cancel the task"); // Ensure the caller is the poster
        require(task.active, "Task is not active"); // Check if the task is active

        task.active = false; // Deactivate the task
        payable(task.poster).transfer(task.reward); // Refund the reward to the poster

        emit TaskCancelled(_taskId, task.poster); // Emit event for task cancellation
    }

    /// @notice Function to get all submissions for a specific task
    /// @param _taskId ID of the task
    /// @return An array of submissions for the task
    /// @dev This function provides a view of all submissions for a task
    function getSubmissions(uint256 _taskId) external view returns (Submission[] memory) {
        return submissions[_taskId]; // Return the submissions array for the task
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MiniTasks {
    struct Task {
        address poster;
        uint256 reward;
        string title;
        string description;
        bool active;
    }

    struct Submission {
        address submitter;
        string cid; // Content Identifier for image
        string title;
        string description;
    }

    uint256 public taskCounter;
    uint256 public totalFunds; // Tracks all funds passing through the platform
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => Submission[]) public submissions;

    event TaskPosted(uint256 taskId, address indexed poster, uint256 reward, string title, string description);
    event TaskCancelled(uint256 taskId, address indexed poster);
    event SubmissionMade(uint256 taskId, address indexed submitter, string cid, string title, string description);
    event WinnerSelected(uint256 taskId, address indexed winner, uint256 reward);

    function postTask(string memory _title, string memory _description) external payable {
        require(msg.value > 0, "Reward must be greater than 0");

        taskCounter++;
        tasks[taskCounter] = Task({
            poster: msg.sender,
            reward: msg.value,
            title: _title,
            description: _description,
            active: true
        });

        emit TaskPosted(taskCounter, msg.sender, msg.value, _title, _description);
    }

    function submitTask(uint256 _taskId, string memory _cid, string memory _title, string memory _description) external {
        require(tasks[_taskId].active, "Task is not active");
        require(msg.sender != tasks[_taskId].poster, "Poster cannot submit");

        submissions[_taskId].push(Submission({
            submitter: msg.sender,
            cid: _cid,
            title: _title,
            description: _description
        }));

        emit SubmissionMade(_taskId, msg.sender, _cid, _title, _description);
    }

    function selectWinner(uint256 _taskId, uint256 _submissionIndex) external {
        Task storage task = tasks[_taskId];
        require(task.poster == msg.sender, "Only the poster can select the winner");
        require(task.active, "Task is not active");

        Submission memory winningSubmission = submissions[_taskId][_submissionIndex];
        task.active = false;
        payable(winningSubmission.submitter).transfer(task.reward);

        // Update totalFunds with the reward amount distributed
        totalFunds += task.reward;

        emit WinnerSelected(_taskId, winningSubmission.submitter, task.reward);
    }

    function cancelTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.poster == msg.sender, "Only the poster can cancel the task");
        require(task.active, "Task is not active");

        task.active = false;
        payable(task.poster).transfer(task.reward);

        emit TaskCancelled(_taskId, task.poster);
    }

    function getSubmissions(uint256 _taskId) external view returns (Submission[] memory) {
        return submissions[_taskId];
    }
}
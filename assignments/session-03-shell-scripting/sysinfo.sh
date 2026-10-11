#!/bin/bash
# =============================================================
# System Information Script
# Session 03 - Shell Scripting Homework
# Name: Pulasari Jai   |   Roll No: 24BCS10656
#
# This script:
#   - prints the current date, hostname and username
#   - prints the disk usage
#   - prints the running processes
#   - uses variables to store data
#   - takes user input with read -p
#   - creates a directory with mkdir
#   - creates a file with touch
#   - saves the running processes into the file using > redirection
# =============================================================

# ----- Student details stored in variables -----
name="Pulasari Jai"
roll_no="24BCS10656"

# ----- Take input from the user using read -p -----
read -p "Enter a name for the report folder: " folder_name
read -p "Enter a short comment: " comment

echo ""
echo "=============================================="
echo "            SYSTEM INFORMATION REPORT"
echo "=============================================="

# ----- Store command output in variables -----
current_date=$(date)
host_name=$(hostname)
user_name=$(whoami)

# ----- Print the basic information -----
echo "Report by    : $name (Roll No: $roll_no)"
echo "Comment      : $comment"
echo "----------------------------------------------"
echo "Current Date : $current_date"
echo "Hostname     : $host_name"
echo "Username     : $user_name"
echo ""

# ----- Disk usage -----
echo "---------- Disk Usage (df -h) ----------"
df -h

echo ""

# ----- Running processes (show the first few on screen) -----
echo "---------- Running Processes (ps) ----------"
ps -e | head -n 10

# ----- Create a directory using mkdir -----
mkdir -p "$folder_name"

# ----- Create a file using touch -----
touch "$folder_name/process.log"

# ----- Save ALL running processes into the file using > redirection -----
ps -e > "$folder_name/process.log"

echo ""
echo "=============================================="
echo "Folder created with : mkdir  -> $folder_name"
echo "File created with   : touch  -> $folder_name/process.log"
echo "Running processes saved into the file using > redirection"
echo "=============================================="

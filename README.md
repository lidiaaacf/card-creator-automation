# GitLab Issues Automated Tracker

## Objective
This project provides an interface to view, create, and track GitLab project issues, with date range filtering and summary statistics. It integrates with the GitLab API to create issues remotely and fetch data for tracking purposes. Additionally, it uses the Cohere AI API to enhance issue specifications following a standardized template.

I created this project for learning and experimentation. As someone who works with issue boards, metrics, and automation, I wanted a tool that could transform simple or poorly described bug findings into well-specified issues for developers. During exploratory testing, it is common to discover multiple bugs or improvements that require documentation; this tool makes the process more dynamic.

The dashboard functionality provides a clear overview of project issues, helping with quality assurance planning and decision-making. By combining issue creation with real-time metrics, the application allows teams to focus not just on fixing and adjusting, but also on planning and improving overall quality.

## Requirements
- Node.js >= 18
- React 18
- Tailwind CSS
- Project dependencies (`npm install` or `yarn`)
- Environment variables:
  - `VITE_ISSUES_GITLAB` → API URL for issues
  - `VITE_PROJETOS_GITLAB` → API URL for projects
  - `VITE_CRIA_ISSUE` → API URL to create new issues

## Main Features
- Select a project and view its issues
- Create new issues via modal
- Search issues by title, description, ID, or author
- Filter issues by date range using a datepicker
- Dynamic dashboard with:
  - Total issues
  - Issues in progress
  - Issues in staging
  - Identified bugs (%)
  - Average issue weight
  - Overdue issues
  - Closed issues
- Responsive interface styled with Tailwind CSS

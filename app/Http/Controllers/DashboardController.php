<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(){
        $user = auth()->user();
        $projects = Project::where('user_id', $user->id)->get();
        $tasks = Task::whereHas('project', function($query) use ($user) {
            $query->Where('user_id', $user->id);
        })->get();

        $stats = [
            'totalProjects' => $projects->count(),
            'totalTasks' => $tasks->count(),
            'completedTasks' => $tasks->where('is_completed', true)->count(),
            'pendingTasks' => $tasks->where('is_completed', false)->count(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'projects' => $projects,
            'tasks' => $tasks,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);

    }
}

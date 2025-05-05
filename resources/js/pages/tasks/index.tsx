// resources/js/Pages/tasks/Index.tsx

import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  List,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  project_id: number;
  project: { id: number; title: string };
}

interface Project {
  id: number;
  title: string;
}

interface Props {
  tasks: {
    data: Task[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
  };
  projects: Project[];
  filters: { search: string; filter: 'all' | 'completed' | 'pending' };
  flash?: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Tasks', href: '/tasks' },
];

export default function TasksIndex({ tasks, projects, filters, flash }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [completionFilter, setCompletionFilter] = useState(filters.filter);

  useEffect(() => {
    if (flash?.success) {
      setToastMessage(flash.success);
      setToastType('success');
      setShowToast(true);
    } else if (flash?.error) {
      setToastMessage(flash.error);
      setToastType('error');
      setShowToast(true);
    }
  }, [flash]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const { data, setData, post, put, processing, reset, delete: destroy } =
    useForm({
      title: '',
      description: '',
      due_date: '',
      project_id: '',
      is_completed: false as boolean,
    });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const action = editingTask ? put : post;
    const url = editingTask
      ? route('tasks.update', editingTask.id)
      : route('tasks.store');
    action(url, {
      onSuccess: () => {
        setIsOpen(false);
        reset();
        setEditingTask(null);
      },
    });
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      project_id: task.project_id.toString(),
      is_completed: task.is_completed,
    });
    setIsOpen(true);
  }

  function confirmDelete(id: number) {
    setDeleteTaskId(id);
    setDeleteOpen(true);
  }

  function handleDelete() {
    if (deleteTaskId) destroy(route('tasks.destroy', deleteTaskId));
    setDeleteOpen(false);
  }

  function applyFilters(params: { page?: number }) {
    router.get(
      route('tasks.index'),
      { search: searchTerm, filter: completionFilter, ...params },
      { preserveState: true }
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ page: 1 });
  }

  function handleFilterChange(value: 'all' | 'completed' | 'pending') {
    setCompletionFilter(value);
    applyFilters({ page: 1 });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tasks" />

      {showToast && (
        <div
          className={`fixed top-4 right-4 flex items-center gap-2 p-4 rounded shadow-lg text-white ${
            toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col flex-1 h-full gap-6 p-6 bg-gradient-to-br from-background to-muted/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your tasks and stay organized
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingTask(null);
                  reset();
                }}
              >
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    required
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_id">Project</Label>
                  <Select
                    value={data.project_id}
                    onValueChange={(val) => setData('project_id', val)}
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={data.due_date}
                    onChange={(e) => setData('due_date', e.target.value)}
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="is_completed"
                    type="checkbox"
                    checked={data.is_completed}
                    onChange={(e) => setData('is_completed', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
                  />
                  <Label htmlFor="is_completed">Completed</Label>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={processing} className="w-full">
                    {editingTask ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this task?
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="space-x-2">
                <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute w-4 h-4 left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </form>

          <Select value={completionFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-auto border rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/20 border-b">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Project</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.data.length > 0 ? (
                tasks.data.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2 font-medium">{task.title}</td>
                    <td className="px-4 py-2 max-w-xs truncate">{task.description || 'No description'}</td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <List className="w-4 h-4 text-muted-foreground" />{task.project.title}
                    </td>
                    <td className="px-4 py-2">
                      {task.due_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No due date</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {task.is_completed ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="w-4 h-4" />Completed
                        </div>
                      ) : (
                        <div className="text-yellow-500">Pending</div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete(task.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-muted-foreground">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm text-muted-foreground">
            Showing {tasks.from} to {tasks.to} of {tasks.total} results
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={tasks.current_page === 1}
              onClick={() => applyFilters({ page: 1 })}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={tasks.current_page === 1}
              onClick={() => applyFilters({ page: tasks.current_page - 1 })}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={tasks.current_page === tasks.last_page}
              onClick={() => applyFilters({ page: tasks.current_page + 1 })}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={tasks.current_page === tasks.last_page}
              onClick={() => applyFilters({ page: tasks.last_page })}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

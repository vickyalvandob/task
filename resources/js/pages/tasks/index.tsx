// resources/js/Pages/tasks/Index.tsx

import { Head, Link, router } from '@inertiajs/react';
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
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  project_id: number;
  project: {
    id: number;
    title: string;
  };
}

interface Project {
  id: number;
  title: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  tasks: {
    data: Task[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  projects: Project[];
  filters: {
    search: string;
    filter: 'all' | 'completed' | 'pending';
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Tasks', href: '/tasks' },
];

export default function TasksIndex({ tasks, projects, filters, flash }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [completionFilter, setCompletionFilter] = useState<
    'all' | 'completed' | 'pending'
  >(filters.filter);

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

    if (editingTask) {
      put(route('tasks.update', editingTask.id), {
        onSuccess: () => {
          setIsOpen(false);
          reset();
          setEditingTask(null);
          // redirect from server will re-fetch index
        },
      });
    } else {
      post(route('tasks.store'), {
        onSuccess: () => {
          setIsOpen(false);
          reset();
          // redirect from server will re-fetch index
        },
      });
    }
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

  function handleDelete(id: number) {
    destroy(route('tasks.destroy', id));
    // server redirect will re-fetch index
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      route('tasks.index'),
      { search: searchTerm, filter: completionFilter },
      { preserveScroll: true }
    );
  }

  function handleFilterChange(value: 'all' | 'completed' | 'pending') {
    setCompletionFilter(value);
    router.get(
      route('tasks.index'),
      { search: searchTerm, filter: value },
      { preserveScroll: true }
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tasks" />

      {/* Toast */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg ${
            toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage your tasks and stay organized
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
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
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
                  />
                  <Label htmlFor="is_completed">Completed</Label>
                </div>

                <Button type="submit" disabled={processing} className="w-full">
                  {editingTask ? 'Update' : 'Create'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </form>

          <Select value={completionFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Project</th>
                  <th className="px-4 py-2 text-left">Due Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.data.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{task.title}</td>
                    <td className="p-4 max-w-[200px] truncate">
                      {task.description ?? 'No description'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4 text-muted-foreground" />
                        {task.project.title}
                      </div>
                    </td>
                    <td className="p-4">
                      {task.due_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No due date</span>
                      )}
                    </td>
                    <td className="p-4">
                      {task.is_completed ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </div>
                      ) : (
                        <div className="text-yellow-500">Pending</div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tasks.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      No tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {tasks.from} to {tasks.to} of {tasks.total} results
          </div>

          <nav className="flex items-center space-x-2">
            {tasks.links.map((link, i) => (
              <Link
                key={i}
                href={link.url || '#'}
                preserveScroll
                className={`px-3 py-1 rounded ${
                  link.active
                    ? 'bg-primary text-white'
                    : 'border border-gray-200 text-gray-500'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </nav>
        </div>
      </div>
    </AppLayout>
  );
}

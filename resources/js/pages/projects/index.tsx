import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
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

interface Project {
  id: number;
  title: string;
  description: string | null;
  tasks_count?: number;
}

interface Props {
  projects: Project[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Projects', href: '/projects' },
];

export default function ProjectsIndex({ projects, flash }: Props) {
  // modal + toast state
  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // show flash
  useEffect(() => {
    if (flash?.success) {
      setToastType('success');
      setToastMessage(flash.success);
      setShowToast(true);
    } else if (flash?.error) {
      setToastType('error');
      setToastMessage(flash.error);
      setShowToast(true);
    }
  }, [flash]);

  // auto-hide toast
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showToast]);

  // form state
  const { data, setData, post, put, processing, reset, delete: destroy } =
    useForm({
      title: '',
      description: '',
    });

  // submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProject) {
      // update
      put(route('projects.update', editingProject.id), {
        onSuccess: () => {
          setIsOpen(false);
        },
      });
    } else {
      // create
      post(route('projects.store'), {
        onSuccess: () => setIsOpen(false),
      });
    }
  };

  // open modal to edit
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setData({
      title: project.title,
      description: project.description || '',
    });
    setIsOpen(true);
  };

  // open delete confirmation
  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  // perform delete
  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    destroy(route('projects.destroy', projectToDelete.id), {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Projects" />

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

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Projects</h1>

          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) {
                reset();
                setEditingProject(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  reset();
                  setEditingProject(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Edit Project' : 'Create New Project'}
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={processing}>
                  {editingProject ? 'Update' : 'Create'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:bg-accent/50 transition-colors"
            >
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">
                  {project.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(project)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(project)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {project.description || 'No description'}
                </p>
                {project.tasks_count !== undefined && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {project.tasks_count} Tasks
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setProjectToDelete(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
            </DialogHeader>
            <p className="py-2">
              Are you sure you want to delete the project "{projectToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

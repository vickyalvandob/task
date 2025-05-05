import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Stats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

interface Props {
  stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard({ stats }: Props) {
  const cards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects.toLocaleString(),
      desc: 'Total project lists',
      icon: List,
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks.toLocaleString(),
      desc: 'All tasks created',
      icon: CheckCircle,
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks.toLocaleString(),
      desc: 'Awaiting completion',
      icon: Clock,
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks.toLocaleString(),
      desc: 'You’ve finished',
      icon: AlertCircle,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Overview of your work</p>
          </div>

          <div className="flex space-x-2">
            <Link href={route('projects.index')}>
              <Button size="sm" className="flex items-center space-x-0 sm:space-x-2">
                <List className="h-5 w-5" />
                <span className="hidden sm:inline">Projects</span>
              </Button>
            </Link>
            <Link href={route('tasks.index')}>
              <Button size="sm" className="flex items-center space-x-0 sm:space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span className="hidden sm:inline">Tasks</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ title, value, desc, icon: Icon }) => (
            <Card key={title} className="bg-background border border-border rounded-lg shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-medium text-primary text-left flex-1">
                  {title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent >
                <div className="text-2xl font-bold leading-none text-primary">{value}</div>
                <p className="text-xs text-muted-foreground mt-2">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

import { BreadcrumbItem } from "@/types";
import { useEffect, useState } from "react";

interface List {
  id: number;
  title: string;
  description: string | null;
  task_count?: number;
}

interface Props {
  list: List[];
  flash?: {
    success?: string;
    error?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Lists',
    href: '/list',
  },
];

export default function ListsIndex({lists, flash}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if(flash?.success){
      setToastMessage(flash.success);
      setToastType('success');
      setShowToast(true);
    }else if(flash?.error) {
      setToastMessage(flash.error);
      setToastType('error');
      setShowToast(true);
    }
  }, [flash]);

  useEffect(() => {
    if(showToast) {
      const timer = setTimeout(() => {
        const timer = setTimeout(() => {
          setShowToast(false);
        }, 3000)
      })
    }
  })
}
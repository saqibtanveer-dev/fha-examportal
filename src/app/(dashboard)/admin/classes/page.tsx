import { listClasses } from '@/modules/classes/class-queries';
import { ClassesPageClient } from './classes-page-client';

export default async function ClassesPage() {
  const classes = await listClasses();
  return <ClassesPageClient classes={classes} />;
}

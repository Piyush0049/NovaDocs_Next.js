import { Suspense } from 'react';
import PDFEditor from './_components/PDFEditor';

interface EditPageProps {
  params: Promise<{ id: string }>; // ✅ params is async now
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params; // ✅ await before using

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-white">Loading editor...</div>
        </div>
      }
    >
      <PDFEditor fileId={id} />
    </Suspense>
  );
}

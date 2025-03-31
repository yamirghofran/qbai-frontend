import MediaUploader from '@/components/upload'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div>
      <MediaUploader />
    </div>
  )
}
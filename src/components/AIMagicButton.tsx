import { useState } from 'react'
import { Button } from './ui/button'
import { Sparkles } from 'lucide-react'
import AIEnhancementModal from './AIEnhancementModal'

interface AIMagicButtonProps {
  sectionType: 'module' | 'userStory' | 'feature'
  sectionTitle: string
  projectId: string
  currentData?: any
  onEnhanced: (enhancedData: any) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export default function AIMagicButton({
  sectionType,
  sectionTitle,
  projectId,
  currentData,
  onEnhanced,
  size = 'sm',
  variant = 'outline',
  className = ''
}: AIMagicButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => setIsModalOpen(true)}
        className={`gap-2 border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 neon-glow ${className}`}
      >
        <Sparkles className="w-4 h-4" />
        AI Magic
      </Button>

      <AIEnhancementModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={(enhancedData) => {
          onEnhanced(enhancedData)
          setIsModalOpen(false)
        }}
        sectionType={sectionType}
        sectionTitle={sectionTitle}
        projectId={projectId}
        currentData={currentData}
      />
    </>
  )
}


import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner@2.0.3'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Trash2, Plus, Edit2, Check, X, Shield, Wand2, CheckCircle2, RotateCcw, Save, Sparkles, Loader2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { ModuleFeature } from './ExcelUtils'
import AIGeneralEnhancement from './AIGeneralEnhancement'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'

// Keep old exports for compatibility
export interface ModuleFeatures {
  [moduleId: string]: string[]
}

export interface ModuleBusinessRules {
  [moduleId: string]: string[]
}

interface ModulesTableProps {
  modules: ModuleFeature[]
  projectId?: string
  onChange: (modules: ModuleFeature[]) => void
}

export default function ModulesTable({ 
  modules,
  projectId,
  onChange
}: ModulesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ModuleFeature | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [selectedBusinessRules, setSelectedBusinessRules] = useState<ModuleBusinessRules>({})
  const [customBusinessRule, setCustomBusinessRule] = useState('')
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null)
  const [editingRuleText, setEditingRuleText] = useState('')
  const [showAIMagicDialog, setShowAIMagicDialog] = useState(false)
  const [aiMagicStage, setAIMagicStage] = useState(0)
  const businessRulesCardRef = useRef<HTMLDivElement>(null)

  const handleAddModule = () => {
    const newModule: ModuleFeature = {
      id: crypto.randomUUID(),
      moduleName: '',
      description: '',
      priority: 'Medium',
      businessImpact: '',
      dependencies: '',
      status: 'Not Started'
    }
    setEditingId(newModule.id)
    setEditForm(newModule)
    onChange([...modules, newModule])
  }

  const handleEdit = (module: ModuleFeature) => {
    setEditingId(module.id)
    // Convert dependencies to comma-separated string for editing
    // Normalize field names - handle both camelCase and snake_case from backend
    const normalizeDependencies = (deps: any): string => {
      if (!deps) return ''
      
      // If it's already a string
      if (typeof deps === 'string') {
        // Check if it's a JSON string
        if (deps.trim().startsWith('[') || deps.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(deps)
            if (Array.isArray(parsed)) {
              return parsed.join(', ')
            }
            return String(parsed)
          } catch {
            // Not valid JSON, return as is (might be comma-separated already)
            return deps
          }
        }
        // Already a comma-separated string
        return deps
      }
      
      // If it's an array, join with commas
      if (Array.isArray(deps)) {
        return deps.join(', ')
      }
      
      // Fallback: convert to string
      return String(deps)
    }
    
    const normalizedModule = {
      ...module,
      moduleName: (module as any).module_name || module.moduleName || '',
      description: module.description || '',
      businessImpact: (module as any).business_impact || module.businessImpact || '',
      dependencies: normalizeDependencies(module.dependencies)
    }
    setEditForm(normalizedModule)
  }

  const handleSave = () => {
    if (editForm && editingId) {
      // Extract values from editForm - check both camelCase and snake_case
      const moduleName = editForm.moduleName || (editForm as any).module_name || ''
      const description = editForm.description || ''
      const businessImpact = editForm.businessImpact || (editForm as any).business_impact || ''
      
      console.log('Saving module:', { moduleName, description, businessImpact, editForm })
      
      if (!moduleName || !description) {
        toast.error('Module name and description are required')
        return
      }
      
      // Find the original module to preserve all its properties
      const originalModule = modules.find(m => m.id === editingId)
      
      // Normalize the module data before saving - preserve all original properties
      const normalizedModule: ModuleFeature = {
        ...originalModule, // Preserve original module properties
        id: editingId, // Ensure ID is preserved
        moduleName: moduleName, // Ensure camelCase name (explicitly set)
        description: description,
        businessImpact: businessImpact, // Ensure camelCase business impact (explicitly set)
        dependencies: editForm.dependencies || originalModule?.dependencies || '',
        priority: editForm.priority || originalModule?.priority || 'Medium',
        status: editForm.status || originalModule?.status || 'Not Started'
      }
      
      // Also set snake_case versions for backend compatibility
      ;(normalizedModule as any).module_name = moduleName
      ;(normalizedModule as any).business_impact = businessImpact
      
      console.log('Normalized module before save:', normalizedModule)
      
      // Update local state and trigger save via onChange
      const updatedModules = modules.map(m => m.id === editingId ? normalizedModule : m)
      onChange(updatedModules)
      setEditingId(null)
      setEditForm(null)
      toast.success('Module saved successfully')
    }
  }

  const handleCancel = () => {
    if (editForm && !editForm.moduleName) {
      // If it's a new module that hasn't been filled, remove it
      onChange(modules.filter(m => m.id !== editingId))
    }
    setEditingId(null)
    setEditForm(null)
  }

  const handleDelete = (id: string) => {
    onChange(modules.filter(m => m.id !== id))
    // Also clear selected module if it's being deleted
    if (selectedModuleId === id) {
      setSelectedModuleId(null)
    }
    toast.success('Module deleted successfully')
  }

  const handleModuleClick = (moduleId: string) => {
    if (editingId) return // Don't allow selection while editing
    setSelectedModuleId(selectedModuleId === moduleId ? null : moduleId)
  }

  // Scroll to business rules card when a module is selected
  useEffect(() => {
    if (selectedModuleId && businessRulesCardRef.current) {
      setTimeout(() => {
        businessRulesCardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        })
      }, 150)
    }
  }, [selectedModuleId])

  // AI Magic stage progression
  useEffect(() => {
    if (!showAIMagicDialog) return

    const stages = [
      { duration: 1500, nextStage: 1 },
      { duration: 2000, nextStage: 2 },
      { duration: 1500, nextStage: 3 },
    ]

    if (aiMagicStage < stages.length) {
      const timer = setTimeout(() => {
        setAIMagicStage(aiMagicStage + 1)
      }, stages[aiMagicStage].duration)

      return () => clearTimeout(timer)
    } else if (aiMagicStage === 3) {
      setTimeout(() => {
        setShowAIMagicDialog(false)
        setAIMagicStage(0)
        toast.success('AI suggestions applied successfully!')
      }, 500)
    }
  }, [showAIMagicDialog, aiMagicStage])

  const handleAIMagic = () => {
    setShowAIMagicDialog(true)
    setAIMagicStage(0)
  }

  // Get recommended business rules based on module name
  const getRecommendedBusinessRules = (moduleName: string): string[] => {
    const rulesMap: Record<string, string[]> = {
      'Login & Authentication': [
        'Password must be minimum 8 characters with uppercase, lowercase, number, and special character',
        'Account locked after 5 consecutive failed login attempts',
        'Session expires after 30 minutes of inactivity',
        'JWT tokens expire after 24 hours',
        '2FA is mandatory for admin accounts',
        'Email verification required before account activation',
        'Password reset link expires after 1 hour',
        'Users cannot reuse last 5 passwords',
        'OAuth accounts must link to existing email or create new account',
        'Concurrent sessions limited to 3 devices per user'
      ],
      'Product Catalogue': [
        'Products must have at least one image before going live',
        'Minimum 50 character product description required',
        'Price cannot be negative or zero',
        'Discount percentage cannot exceed 90%',
        'Out-of-stock products remain visible but cannot be purchased',
        'Product SKU must be unique across all products',
        'Categories can be nested up to 3 levels deep',
        'Products must belong to at least one category',
        'Image file size cannot exceed 5MB',
        'Maximum 10 images per product'
      ],
      'Shopping Cart': [
        'Cart items expire after 7 days of inactivity',
        'Maximum 50 items allowed per cart',
        'Quantity cannot exceed available stock',
        'Cart total must be recalculated on every item change',
        'Promo codes expire at specified date/time',
        'Only one promo code can be applied per order',
        'Guest carts merge with user cart upon login',
        'Price lock for 15 minutes after adding to cart',
        'Minimum order value of $10 required for checkout',
        'Free shipping applies for orders over $50'
      ],
      'Checkout Module': [
        'Billing and shipping addresses can be different',
        'Phone number required for delivery confirmation',
        'Order cannot proceed if any item is out of stock',
        'Tax calculated based on shipping address',
        'Shipping cost calculated based on weight and destination',
        'Guest checkout allowed but requires email verification',
        'Order confirmation sent within 2 minutes of placement',
        'Inventory reserved during checkout for 15 minutes',
        'PO Box addresses not allowed for certain product types',
        'International orders require additional customs information'
      ],
      'Payment Processing': [
        'Payment must be verified before order confirmation',
        'Failed payments trigger automatic retry up to 3 times',
        'Refunds processed within 5-7 business days',
        'Partial refunds allowed for returns',
        'Payment methods expire and must be re-verified annually',
        '3D Secure verification required for transactions over $500',
        'Cryptocurrency payments convert at time of transaction',
        'Stored payment methods must be tokenized, never raw card numbers',
        'Chargeback notifications sent immediately to admin',
        'Daily transaction limit of $10,000 per user account'
      ],
      'Order Management': [
        'Orders can be cancelled within 2 hours of placement',
        'Cancellation not allowed once shipping label is generated',
        'Returns accepted within 30 days of delivery',
        'Refund amount excludes shipping costs unless item is defective',
        'Order status updates trigger email notifications',
        'Tracking number provided within 24 hours of shipment',
        'Invoice generated immediately upon order placement',
        'Reorders use latest product pricing, not original order price',
        'Bulk orders (>100 items) require manager approval',
        'Priority shipping upgrade available until order ships'
      ],
      'User Profile': [
        'Users can save up to 5 addresses',
        'One address must be marked as default',
        'Profile picture maximum size 2MB',
        'Email change requires verification of both old and new email',
        'Users can delete account but order history is retained',
        'Wishlist limited to 100 items',
        'Wishlist items out of stock for 90 days are auto-removed',
        'Notification preferences saved per communication channel',
        'Privacy settings allow opt-out of marketing emails',
        'Account data export available in GDPR-compliant format'
      ],
      'Inventory Management': [
        'Low stock alert triggered at 10 units or less',
        'Automatic reorder triggered at 5 units or less',
        'Inventory updates sync in real-time across all channels',
        'Stock reservation prevents overselling during checkout',
        'Reserved stock released after 15 minutes if checkout abandoned',
        'Backorders allowed with estimated restock date',
        'Inventory audit required monthly for discrepancy resolution',
        'SKU changes trigger notification to all affected orders',
        'Multi-warehouse support with priority-based fulfillment',
        'Damaged/returned items quarantined for inspection'
      ],
      'Product Reviews & Ratings': [
        'Only verified purchasers can leave reviews',
        'Reviews can be submitted within 90 days of purchase',
        'Minimum 10 character review text required',
        'Profanity and personal information automatically filtered',
        'Reviews moderated within 24 hours',
        'Users can edit review once within 48 hours',
        'Sellers can respond to reviews once',
        'Average rating calculated from verified reviews only',
        'Review images limited to 3 per review',
        'Spam reviews detected and removed automatically'
      ],
      'Search & Recommendations': [
        'Search results ranked by relevance, then sales, then rating',
        'Misspellings auto-corrected using fuzzy matching',
        'Search history stored for 90 days for logged-in users',
        'Recommendations updated every 24 hours',
        'Personalized recommendations based on browse and purchase history',
        'Trending products calculated from last 7 days activity',
        'Out-of-stock products ranked lower in search results',
        'Search filters persist during session',
        'Recently viewed limited to last 20 products',
        'Collaborative filtering used for "Customers Also Bought"'
      ],
      'Admin Dashboard': [
        'Only admin role can access dashboard',
        'All actions logged with timestamp and user ID',
        'Bulk operations limited to 1000 items at once',
        'Product approval required before going live',
        'Price changes over 20% require manager approval',
        'Promotional campaigns must have start and end dates',
        'Dashboard data refreshed every 5 minutes',
        'Export reports limited to last 2 years of data',
        'User role changes require super admin approval',
        'Audit trail maintained for all admin actions'
      ],
      'Notifications & Alerts': [
        'Order confirmation sent immediately',
        'Shipping notifications sent when tracking number assigned',
        'Delivery confirmation sent upon carrier confirmation',
        'Abandoned cart reminders sent after 24 hours',
        'Price drop alerts sent for wishlisted items',
        'Back-in-stock notifications sent within 1 hour of restock',
        'Promotional emails limited to 2 per week',
        'SMS notifications require opt-in',
        'Unsubscribe link required in all marketing emails',
        'Critical alerts (fraud, security) sent via all channels'
      ]
    }
    
    return rulesMap[moduleName] || []
  }

  // Add a recommended business rule to the selected module
  const handleAddRecommendedRule = (rule: string) => {
    if (!selectedModuleId) return
    
    const currentRules = selectedBusinessRules[selectedModuleId] || []
    if (currentRules.includes(rule)) return // Don't add duplicates
    
    setSelectedBusinessRules({
      ...selectedBusinessRules,
      [selectedModuleId]: [...currentRules, rule]
    })
  }

  // Add a custom business rule to the selected module
  const handleAddCustomRule = () => {
    if (!selectedModuleId || !customBusinessRule.trim()) return
    
    const currentRules = selectedBusinessRules[selectedModuleId] || []
    if (currentRules.includes(customBusinessRule.trim())) return // Don't add duplicates
    
    setSelectedBusinessRules({
      ...selectedBusinessRules,
      [selectedModuleId]: [...currentRules, customBusinessRule.trim()]
    })
    setCustomBusinessRule('')
  }

  // Delete a business rule from the selected module
  const handleDeleteRule = (ruleIndex: number) => {
    if (!selectedModuleId) return
    
    const currentRules = selectedBusinessRules[selectedModuleId] || []
    setSelectedBusinessRules({
      ...selectedBusinessRules,
      [selectedModuleId]: currentRules.filter((_, idx) => idx !== ruleIndex)
    })
  }

  // Start editing a business rule
  const handleStartEditRule = (ruleIndex: number, ruleText: string) => {
    setEditingRuleIndex(ruleIndex)
    setEditingRuleText(ruleText)
  }

  // Save edited business rule
  const handleSaveEditedRule = () => {
    if (!selectedModuleId || editingRuleIndex === null) return
    
    const currentRules = selectedBusinessRules[selectedModuleId] || []
    setSelectedBusinessRules({
      ...selectedBusinessRules,
      [selectedModuleId]: currentRules.map((r, idx) => 
        idx === editingRuleIndex ? editingRuleText.trim() : r
      )
    })
    setEditingRuleIndex(null)
    setEditingRuleText('')
  }

  // Cancel editing business rule
  const handleCancelEditRule = () => {
    setEditingRuleIndex(null)
    setEditingRuleText('')
  }

  // Save business rules
  const handleSaveBusinessRules = () => {
    if (!selectedModuleId) return
    
    const selectedModule = modules.find(m => m.id === selectedModuleId)
    const moduleName = (selectedModule as any)?.module_name || selectedModule?.moduleName || 'Module'
    const ruleCount = selectedBusinessRules[selectedModuleId]?.length || 0
    
    toast.success(`Business rules saved for "${moduleName}" with ${ruleCount} rule${ruleCount !== 1 ? 's' : ''}`)
  }

  // Reset all business rules for the current module
  const handleResetBusinessRules = () => {
    if (!selectedModuleId) return
    
    const selectedModule = modules.find(m => m.id === selectedModuleId)
    const moduleName = (selectedModule as any)?.module_name || selectedModule?.moduleName || 'Module'
    
    setSelectedBusinessRules({
      ...selectedBusinessRules,
      [selectedModuleId]: []
    })
    
    toast.success(`All business rules cleared for "${moduleName}"`)
  }

  // Select all recommended business rules
  const handleSelectAllRecommendedRules = () => {
    if (!selectedModuleId) return
    
    const selectedModule = modules.find(m => m.id === selectedModuleId)
    const moduleName = (selectedModule as any)?.module_name || selectedModule?.moduleName || ''
    const recommendedRules = getRecommendedBusinessRules(moduleName)
    const currentRules = selectedBusinessRules[selectedModuleId] || []
    
    // Filter out rules that are already selected
    const newRules = recommendedRules.filter(rule => !currentRules.includes(rule))
    
    if (newRules.length === 0) {
      toast.info('All recommended business rules are already selected')
      return
    }
    
    setSelectedBusinessRules({
      ...selectedBusinessRules,
      [selectedModuleId]: [...currentRules, ...newRules]
    })
    
    toast.success(`Added ${newRules.length} recommended business rule${newRules.length !== 1 ? 's' : ''}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-muted'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'In Progress': return 'bg-primary/20 text-primary border-primary/30'
      case 'Not Started': return 'bg-muted text-muted-foreground border-muted-foreground/30'
      default: return 'bg-muted'
    }
  }

  if (modules.length === 0 && !editingId) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg bg-background/50">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg mb-2">No Modules Added Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Modules represent the major functional areas of your application. Start by adding your first module.
          </p>
          <div className="flex gap-2 justify-center">
            <AIGeneralEnhancement
              modules={modules}
              projectId={projectId}
              onEnhanced={onChange}
            />
            <Button
              onClick={handleAddModule}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Add First Module
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg">Modules</h3>
          <p className="text-sm text-muted-foreground">
            Define the major functional areas of your application
          </p>
        </div>
        <div className="flex gap-2">
          <AIGeneralEnhancement
            modules={modules}
            projectId={projectId}
            onEnhanced={onChange}
          />
          <Button
            onClick={handleAddModule}
            className="gap-2 bg-primary hover:bg-primary/90"
            disabled={editingId !== null}
          >
            <Plus className="w-4 h-4" />
            Add Module
          </Button>
        </div>
      </div>

      <div className="border border-primary/20 rounded-lg overflow-hidden bg-background/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-primary/20 hover:bg-primary/5">
                <TableHead className="w-[200px]">Module Name</TableHead>
                <TableHead className="w-[300px]">Description</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[200px]">Business Impact</TableHead>
                <TableHead className="w-[150px]">Dependencies</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => {
                const isSelected = selectedModuleId === module.id
                return (
                <TableRow 
                  key={module.id} 
                  className={`border-primary/20 hover:bg-primary/5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => handleModuleClick(module.id)}
                >
                  {editingId === module.id && editForm ? (
                    <>
                      <TableCell>
                        <Input
                          value={editForm.moduleName || (editForm as any).module_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, moduleName: e.target.value })}
                          placeholder="Module name..."
                          className="bg-input-background border-primary/30"
                          autoFocus
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description..."
                          className="bg-input-background border-primary/30"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editForm.priority}
                          onValueChange={(value: any) => setEditForm({ ...editForm, priority: value })}
                        >
                          <SelectTrigger className="bg-input-background border-primary/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="High" value="High">High</SelectItem>
                            <SelectItem key="Medium" value="Medium">Medium</SelectItem>
                            <SelectItem key="Low" value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editForm.businessImpact || (editForm as any).business_impact || ''}
                          onChange={(e) => setEditForm({ ...editForm, businessImpact: e.target.value })}
                          placeholder="Business impact..."
                          className="bg-input-background border-primary/30"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editForm.dependencies}
                          onChange={(e) => setEditForm({ ...editForm, dependencies: e.target.value })}
                          placeholder="Dependencies..."
                          className="bg-input-background border-primary/30"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editForm.status}
                          onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
                        >
                          <SelectTrigger className="bg-input-background border-primary/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="Not Started" value="Not Started">Not Started</SelectItem>
                            <SelectItem key="In Progress" value="In Progress">In Progress</SelectItem>
                            <SelectItem key="Completed" value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSave}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{(module as any).module_name || module.moduleName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{module.description}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(module.priority)}>
                          {module.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{(module as any).business_impact || module.businessImpact || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {(() => {
                          // Helper function to format dependencies
                          const formatDependencies = (deps: any): string => {
                            if (!deps) return '-'
                            
                            // If it's already a string (comma-separated), return as is
                            if (typeof deps === 'string') {
                              // Check if it's a JSON string
                              if (deps.trim().startsWith('[') || deps.trim().startsWith('{')) {
                                try {
                                  const parsed = JSON.parse(deps)
                                  if (Array.isArray(parsed)) {
                                    return parsed.join(', ')
                                  }
                                  return String(parsed)
                                } catch {
                                  // Not valid JSON, return as is (might be comma-separated already)
                                  return deps
                                }
                              }
                              // Already a comma-separated string
                              return deps
                            }
                            
                            // If it's an array, join with commas
                            if (Array.isArray(deps)) {
                              return deps.join(', ')
                            }
                            
                            // Fallback: convert to string
                            return String(deps)
                          }
                          
                          return formatDependencies(module.dependencies)
                        })()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(module.status)}>
                          {module.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(module)}
                            className="h-8 w-8 p-0"
                            disabled={editingId !== null}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(module.id)}
                            className="h-8 w-8 p-0"
                            disabled={editingId !== null}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {modules.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {modules.length} module{modules.length !== 1 ? 's' : ''} • 
          User Stories and Features/Tasks will be linked to these modules
        </div>
      )}

      {/* Business Rules Management Panel */}
      {selectedModuleId && (() => {
        const selectedModule = modules.find(m => m.id === selectedModuleId)
        if (!selectedModule) return null
        
        const moduleName = (selectedModule as any)?.module_name || selectedModule?.moduleName || 'Module'
        const recommendedRules = getRecommendedBusinessRules(moduleName)
        const moduleSelectedRules = selectedBusinessRules[selectedModuleId] || []
        
        return (
          <div ref={businessRulesCardRef}>
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      {moduleName} - Business Rules
                    </CardTitle>
                    <CardDescription>
                      Define business rules and constraints for this module
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleAIMagic}
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                  >
                    <Wand2 className="w-4 h-4" />
                    AI Magic
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Business Rules Section */}
                {moduleSelectedRules.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm text-primary flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Selected Business Rules ({moduleSelectedRules.length})
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {moduleSelectedRules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-3 rounded-md bg-primary/10 border border-primary/30 hover:bg-primary/15 transition-colors group"
                        >
                          {editingRuleIndex === idx ? (
                            <>
                              <Input
                                value={editingRuleText}
                                onChange={(e) => setEditingRuleText(e.target.value)}
                                className="bg-input-background border-primary/30 text-xs flex-1"
                                autoFocus
                              />
                              <div className="flex gap-1">
                                <Button
                                  onClick={handleSaveEditedRule}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 hover:bg-green-500/10 hover:text-green-400"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  onClick={handleCancelEditRule}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-foreground flex-1">{rule}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  onClick={() => handleStartEditRule(idx, rule)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteRule(idx)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Custom Business Rule */}
                <div className="space-y-2">
                  <Label className="text-sm">Add Custom Business Rule</Label>
                  <div className="flex gap-2">
                    <Input
                      value={customBusinessRule}
                      onChange={(e) => setCustomBusinessRule(e.target.value)}
                      placeholder="Enter custom business rule..."
                      className="bg-input-background border-primary/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCustomRule()
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddCustomRule}
                      disabled={!customBusinessRule.trim()}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Recommended Business Rules */}
                {recommendedRules.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">
                        Recommended Business Rules ({recommendedRules.length})
                      </Label>
                      <Button
                        onClick={handleSelectAllRecommendedRules}
                        size="sm"
                        variant="outline"
                        className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary text-xs h-7"
                        disabled={recommendedRules.every(r => moduleSelectedRules.includes(r))}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Select All ({recommendedRules.filter(r => !moduleSelectedRules.includes(r)).length})
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-secondary/20 hover:scrollbar-thumb-primary/50">
                      {recommendedRules.map((rule, idx) => {
                        const isAlreadySelected = moduleSelectedRules.includes(rule)
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => handleAddRecommendedRule(rule)}
                            disabled={isAlreadySelected}
                            className={`flex items-start gap-2 p-2 rounded-md border text-left transition-colors ${
                              isAlreadySelected
                                ? 'bg-primary/5 border-primary/10 opacity-50 cursor-not-allowed'
                                : 'bg-secondary/30 border-primary/20 hover:bg-primary/10 hover:border-primary/30 cursor-pointer'
                            }`}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                              isAlreadySelected ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <span className="text-xs text-muted-foreground">{rule}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Save and Reset Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/20">
                  <Button
                    onClick={handleResetBusinessRules}
                    variant="outline"
                    className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                    disabled={moduleSelectedRules.length === 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Rules
                  </Button>
                  <Button
                    onClick={handleSaveBusinessRules}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4" />
                    Save Rules
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })()}

      {/* AI Magic Dialog */}
      <Dialog open={showAIMagicDialog} onOpenChange={setShowAIMagicDialog}>
        <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Wand2 className="w-5 h-5" />
              AI Magic
            </DialogTitle>
            <DialogDescription>
              {aiMagicStage === 0 && "Connecting to Agent..."}
              {aiMagicStage === 1 && "Generating content with AI..."}
              {aiMagicStage === 2 && "Fetching details..."}
              {aiMagicStage === 3 && "Complete!"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((stage) => (
              <div key={stage} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    aiMagicStage > stage
                      ? 'bg-primary'
                      : aiMagicStage === stage
                      ? 'bg-primary/50 animate-pulse'
                      : 'bg-muted'
                  }`}
                >
                  {aiMagicStage > stage && <Check className="w-3 h-3 text-background" />}
                </div>
                <span className={`text-sm ${aiMagicStage >= stage ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {stage === 0 && "Connecting to Agent"}
                  {stage === 1 && "Creating magic with AI"}
                  {stage === 2 && "Almost there… retrieving details…"}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

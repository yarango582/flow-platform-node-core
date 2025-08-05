/**
 * Validation interfaces for Flow Platform
 * Used across microservices for consistent validation reporting
 */

export interface ValidationError {
  code: string
  message: string
  nodeId?: string
  field?: string
  severity?: 'error' | 'critical'
  details?: Record<string, any>
}

export interface ValidationWarning {
  code: string
  message: string
  nodeId?: string
  field?: string
  suggestion?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  metadata?: {
    validatedAt: string
    validatorVersion: string
    totalNodes: number
    totalConnections: number
  }
}

/**
 * Flow-specific validation result
 */
export interface FlowValidationResult extends ValidationResult {
  flowId?: string
  compatibilityIssues?: Array<{
    sourceNodeId: string
    targetNodeId: string
    level: 'full' | 'partial' | 'conditional' | 'none'
    valid: boolean
    message?: string
  }>
}

// Re-export compatibility validation
export type { CompatibilityValidationResult } from './compatibility.interface'

type AuthRole = 'student' | 'teacher' | 'admin'

type StoredAccount = {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: AuthRole
  createdAt: number
}

type AuthUser = {
  id: string
  email: string
  full_name: string
  role: AuthRole
  isAdmin?: boolean
}

const ACCOUNT_STORAGE_KEY = 'cognify_accounts'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return []

  const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts))
}

export function createLocalAccount(input: {
  firstName: string
  lastName: string
  email: string
  password: string
}): AuthUser {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const email = normalizeEmail(input.email)
  const password = input.password

  if (!firstName || !lastName) {
    throw new Error('Please provide your first and last name.')
  }

  if (!email) {
    throw new Error('Email is required.')
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.')
  }

  const accounts = readAccounts()
  const alreadyExists = accounts.some((account) => normalizeEmail(account.email) === email)
  if (alreadyExists) {
    throw new Error('An account with this email already exists.')
  }

  const newAccount: StoredAccount = {
    id: makeId(),
    firstName,
    lastName,
    email,
    password,
    role: 'student',
    createdAt: Date.now(),
  }

  accounts.push(newAccount)
  writeAccounts(accounts)

  return {
    id: newAccount.id,
    email: newAccount.email,
    full_name: `${newAccount.firstName} ${newAccount.lastName}`,
    role: 'student',
  }
}

export function authenticateLocalAccount(emailInput: string, passwordInput: string): AuthUser | null {
  const email = normalizeEmail(emailInput)
  const password = passwordInput

  const account = readAccounts().find(
    (candidate) => normalizeEmail(candidate.email) === email && candidate.password === password
  )

  if (!account) {
    return null
  }

  return {
    id: account.id,
    email: account.email,
    full_name: `${account.firstName} ${account.lastName}`,
    role: account.role,
    isAdmin: account.role === 'admin',
  }
}

"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

interface IconResult {
  name: string
  icon: string
  bundleId: string
}

const COUNTRY_OPTIONS = [
  { value: "cn", label: "国区（CN）" },
  { value: "hk", label: "港区（HK）" },
  { value: "us", label: "美区（US）" },
]

export function IconSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [query, setQuery] = useState("")
  const [country, setCountry] = useState("cn")
  const [results, setResults] = useState<IconResult[]>([])
  const [loading, setLoading] = useState(false)
  const [manualMode, setManualMode] = useState(false)

  async function handleSearch() {
    const term = query.trim()
    if (!term) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/itunes?term=${encodeURIComponent(term)}&country=${country}`
      ).then((r) => r.json())

      const items: IconResult[] = (res.results || []).filter(
        (r: IconResult) => r.bundleId
      )
      setResults(items.slice(0, 12))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="space-y-2">
      <Label>应用图标</Label>
      <div className="flex gap-2">
        <Input
          placeholder="搜索应用名称"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Select
          value={country}
          onValueChange={(v) => setCountry(v ?? "cn")}
          items={COUNTRY_OPTIONS}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_OPTIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSearch}
          disabled={loading}
        >
          <Search className="h-4 w-4 mr-1" />
          {loading ? "搜索中..." : "搜索"}
        </Button>
      </div>

      {!manualMode && results.length > 0 && (
        <div className="grid grid-cols-6 gap-2">
          {results.map((item) => (
            <button
              key={item.bundleId}
              type="button"
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                value === item.icon
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
              onClick={() => onChange(item.icon)}
              title={item.name}
            >
              <Image
                src={item.icon}
                alt={item.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          placeholder="图标 URL（可手动输入）"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setManualMode(true)
          }}
          onFocus={() => setManualMode(true)}
          onBlur={() => setManualMode(false)}
        />
        {value && (
          <div className="h-8 w-8 flex-shrink-0 rounded overflow-hidden border">
            <Image
              src={value}
              alt="icon"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  )
}

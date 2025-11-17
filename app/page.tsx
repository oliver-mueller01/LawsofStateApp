"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale } from "lucide-react"
import { useEffect, useState } from "react"

function parseHtmlToText(html: string): string {
  if (!html) return ""

  let text = html
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim()

  return text.replace(/\n\s*\n/g, "\n\n")
}

export default function GesetzePage() {
  const [categories, setCategories] = useState<any[]>([])
  const [lawData, setLawData] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const [catRes, lawRes] = await Promise.all([
        fetch("/data/categories.json"),
        fetch("/data/laws.json"),
      ])

      const [catData, lawData] = await Promise.all([catRes.json(), lawRes.json()])
      setCategories(catData)
      setLawData(lawData)
    }

    loadData()
  }, [])

  const lawsByCategory = categories.map((category) => ({
    ...category,
    laws: lawData.filter((law) => law.categoryId === category.id),
  }))

  return (
    <div className="min-h-screen bg-[#071b35]">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <img src="/latest.png" alt="Logo" width={200} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-balance text-white">San Andreas State Legal Code</h1>
          <p className="text-muted-foreground text-lg text-balance text-white">
            Vollständige Gesetzessammlung des Staates San Andreas
          </p>
          <p className="mt-2 text-muted-foreground text-nd text-balance text-white">
            Letzte Aktualisierung: 17.11.2025 - 22:30 Uhr
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
          </CardHeader>

          <CardContent className="-mt-10">
            {lawsByCategory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Lade Gesetze...</p>
            ) : (
              // Kategorien (nur eine offen)
              <Accordion type="single" collapsible className="w-full">
                {lawsByCategory.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      <div className="text-left">
                        <div>{category.name}</div>
                        <div className="text-sm font-normal text-muted-foreground">{category.description}</div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      {/* Gesetze innerhalb der Kategorie */}
                      <Accordion type="multiple" className="w-full mt-2">
                        {category.laws.map((law) => {
                          const isTitle =
                            !law.body ||
                            law.body.trim() === "<p></p>" ||
                            law.name.toLowerCase().includes("titel") ||
                            law.name.toLowerCase().includes("teil")

                          if (isTitle) {
                            return (
                              <div
                                key={law.id}
                                className="mt-6 mb-3 text-primary font-bold text-base border-b border-primary/30 pb-1 uppercase tracking-wide"
                              >
                                {law.name}
                              </div>
                            )
                          }

                          return (
                            <AccordionItem
                              key={law.id}
                              value={law.id}
                              className="border-l-2 border-primary/20 pl-3"
                            >
                              <AccordionTrigger className="text-base font-medium hover:no-underline py-3">
                                <div className="text-left flex items-start gap-3 w-full">
                                  <div className="flex-1">
                                    <div className="font-semibold">{law.name}</div>
                                    {(law.fineAmountMin !== null || law.fineAmountMax !== null) && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Strafrahmen: ${law.fineAmountMin?.toLocaleString() || "0"} - $
                                        {law.fineAmountMax?.toLocaleString() || "0"}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent>
                                <div className="bg-muted/30 rounded-lg p-4 mt-2">
                                  <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                    {parseHtmlToText(law.body)}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground text-white">
          <p>San Andreas State Gesetzbuch - Offizielle Gesetzessammlung</p>
          <p className="mt-1 text-white">Diese Übersicht dient zu Informationszwecken für Bürger und Rechtsanwälte.</p>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Download, Upload, GripHorizontal, Plus, Trash2, RotateCcw, Star, ImageIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import AuthButton from "./components/auth-button"

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  rotation: number
  fontSize: number
  color: string
}

interface MemeTemplate {
  id: string
  name: string
  url: string
  thumbnail?: string
}

export default function MemeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const lastMousePos = useRef<{ x: number; y: number } | null>(null)
  const [popularMemes, setPopularMemes] = useState<MemeTemplate[]>(() => {
    const saved = localStorage.getItem("popularMemes")
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "1",
            name: "Drake",
            url: "/placeholder.svg?height=400&width=400",
          },
          {
            id: "2",
            name: "Distracted Boyfriend",
            url: "/placeholder.svg?height=400&width=400",
          },
          {
            id: "3",
            name: "Two Buttons",
            url: "/placeholder.svg?height=400&width=400",
          },
        ]
  })

  const addNewText = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: "New Text",
      x: image ? image.width / 2 : 200,
      y: image ? image.height / 2 : 200,
      rotation: 0,
      fontSize: 40,
      color: "#ffffff",
    }
    setTextElements((prev) => [...prev, newElement])
  }

  const removeText = (id: string) => {
    setTextElements((prev) => prev.filter((el) => el.id !== id))
  }

  const updateText = (id: string, updates: Partial<TextElement>) => {
    setTextElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)))
  }

  const saveAsTemplate = () => {
    if (!image) return

    const newTemplate: MemeTemplate = {
      id: Date.now().toString(),
      name: `Template ${popularMemes.length + 1}`,
      url: image.src,
    }

    setPopularMemes((prev) => {
      const updated = [...prev, newTemplate]
      localStorage.setItem("popularMemes", JSON.stringify(updated))
      return updated
    })
  }

  const removeTemplate = (id: string) => {
    setPopularMemes((prev) => {
      const updated = prev.filter((template) => template.id !== id)
      localStorage.setItem("popularMemes", JSON.stringify(updated))
      return updated
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = e.target?.result as string
        img.onload = () => {
          setImage(img)
          // Reset text positions when new image is loaded
          setTextElements([
            {
              id: "text-1",
              text: "TOP TEXT",
              x: img.width / 2,
              y: 50,
              rotation: 0,
              fontSize: 40,
              color: "#ffffff",
            },
            {
              id: "text-2",
              text: "BOTTOM TEXT",
              x: img.width / 2,
              y: img.height - 50,
              rotation: 0,
              fontSize: 40,
              color: "#ffffff",
            },
          ])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const selectTemplate = (url: string) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = url
    img.onload = () => {
      setImage(img)
      setTextElements([
        {
          id: "text-1",
          text: "TOP TEXT",
          x: img.width / 2,
          y: 50,
          rotation: 0,
          fontSize: 40,
          color: "#ffffff",
        },
        {
          id: "text-2",
          text: "BOTTOM TEXT",
          x: img.width / 2,
          y: img.height - 50,
          rotation: 0,
          fontSize: 40,
          color: "#ffffff",
        },
      ])
    }
  }

  const calculateScale = useCallback(() => {
    if (!image || !containerRef.current) return 1

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const imageWidth = image.width

    return containerWidth / imageWidth
  }, [image])

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !ctx || !image) return

    // Set canvas size to match image
    canvas.width = image.width
    canvas.height = image.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image
    ctx.drawImage(image, 0, 0)

    // Draw each text element
    textElements.forEach((element) => {
      // Save the current context state
      ctx.save()

      // Move to the text's position and rotate
      ctx.translate(element.x, element.y)
      ctx.rotate((element.rotation * Math.PI) / 180)

      // Configure text style
      ctx.fillStyle = element.color
      ctx.strokeStyle = "black"
      ctx.lineWidth = element.fontSize / 8
      ctx.textAlign = "center"
      ctx.font = `bold ${element.fontSize}px Impact`

      // Draw the text
      ctx.strokeText(element.text, 0, 0)
      ctx.fillText(element.text, 0, 0)

      // Restore the context state
      ctx.restore()
    })
  }, [image, textElements])

  const handleDragStart = (event: React.MouseEvent | React.TouchEvent, id: string) => {
    event.preventDefault()
    setDraggedItem(id)

    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX
    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY

    lastMousePos.current = { x: clientX, y: clientY }
  }

  const handleRotateStart = (event: React.MouseEvent | React.TouchEvent, id: string) => {
    event.preventDefault()
    event.stopPropagation()
    setIsRotating(id)

    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX
    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY

    lastMousePos.current = { x: clientX, y: clientY }
  }

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if ((!draggedItem && !isRotating) || !image || !containerRef.current || !lastMousePos.current) return

      const container = containerRef.current.getBoundingClientRect()
      const currentScale = calculateScale()

      let clientX: number
      let clientY: number

      if (event instanceof MouseEvent) {
        clientX = event.clientX
        clientY = event.clientY
      } else {
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      }

      const deltaX = (clientX - lastMousePos.current.x) / currentScale
      const deltaY = (clientY - lastMousePos.current.y) / currentScale

      if (draggedItem) {
        setTextElements((prev) =>
          prev.map((el) => {
            if (el.id === draggedItem) {
              return {
                ...el,
                x: el.x + deltaX,
                y: el.y + deltaY,
              }
            }
            return el
          }),
        )
      } else if (isRotating) {
        setTextElements((prev) =>
          prev.map((el) => {
            if (el.id === isRotating) {
              const rect = containerRef.current!.getBoundingClientRect()
              const centerX = el.x * currentScale + rect.left
              const centerY = el.y * currentScale + rect.top

              const angle = (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI

              return {
                ...el,
                rotation: angle + 90,
              }
            }
            return el
          }),
        )
      }

      lastMousePos.current = { x: clientX, y: clientY }
    },
    [draggedItem, isRotating, calculateScale, image],
  )

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setIsRotating(null)
    lastMousePos.current = null
  }, [])

  const downloadMeme = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "meme.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  useEffect(() => {
    drawMeme()
  }, [drawMeme])

  useEffect(() => {
    const newScale = calculateScale()
    setScale(newScale)
  }, [calculateScale])

  useEffect(() => {
    if (draggedItem || isRotating) {
      window.addEventListener("mousemove", handleDrag)
      window.addEventListener("mouseup", handleDragEnd)
      window.addEventListener("touchmove", handleDrag)
      window.addEventListener("touchend", handleDragEnd)

      return () => {
        window.removeEventListener("mousemove", handleDrag)
        window.removeEventListener("mouseup", handleDragEnd)
        window.removeEventListener("touchmove", handleDrag)
        window.removeEventListener("touchend", handleDragEnd)
      }
    }
  }, [draggedItem, isRotating, handleDrag, handleDragEnd])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 border-b bg-background">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 p-4">
           
            {popularMemes.map((meme) => (
              <div key={meme.id} className="flex items-center gap-2">
                <Button variant="outline" className="flex-shrink-0" onClick={() => selectTemplate(meme.url)}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {meme.name}
                </Button>
                {/* Only show delete option for custom templates */}
                {Number(meme.id) > 3 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive" onClick={() => removeTemplate(meme.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Template
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
            ))}
             <AuthButton />
          </div>
          
          <ScrollBar orientation="horizontal" />
          
        </ScrollArea>
      </div>

      <div className="flex-1 flex gap-6 p-4">
        <div className="flex-1 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Meme Generator</CardTitle>
              <CardDescription>
                Upload an image or select a template. Add text, drag to position, and rotate!
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                <Label htmlFor="image-upload" className="flex items-center gap-2 cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </span>
                  </Button>
                </Label>
                {image && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Star className="w-4 h-4 mr-2" />
                        Save as Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save as Template</DialogTitle>
                        <DialogDescription>Add this image to your templates for quick access.</DialogDescription>
                      </DialogHeader>
                      <Button onClick={saveAsTemplate}>Save Template</Button>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Text Elements</h3>
                  <Button onClick={addNewText} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Text
                  </Button>
                </div>

                {textElements.map((element, index) => (
                  <div key={element.id} className="grid gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`text-${element.id}`}>Text {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeText(element.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      id={`text-${element.id}`}
                      value={element.text}
                      onChange={(e) => updateText(element.id, { text: e.target.value.toUpperCase() })}
                      placeholder="Enter text"
                    />

                    <div className="grid gap-2">
                      <Label>Font Size</Label>
                      <Slider
                        value={[element.fontSize]}
                        onValueChange={(value) => updateText(element.id, { fontSize: value[0] })}
                        min={20}
                        max={80}
                        step={1}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`color-${element.id}`}>Text Color</Label>
                      <Input
                        type="color"
                        id={`color-${element.id}`}
                        value={element.color}
                        onChange={(e) => updateText(element.id, { color: e.target.value })}
                        className="w-20 h-10"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <div
                  ref={containerRef}
                  className="relative border rounded-lg overflow-hidden"
                  style={{ touchAction: draggedItem || isRotating ? "none" : "auto" }}
                >
                  <canvas ref={canvasRef} className="max-w-full h-auto" />
                  {image &&
                    textElements.map((element) => (
                      <div
                        key={element.id}
                        className="absolute"
                        style={{
                          left: `${element.x * scale}px`,
                          top: `${element.y * scale}px`,
                          transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                        }}
                      >
                        <div
                          className="cursor-move flex items-center gap-2 select-none touch-none"
                          onMouseDown={(e) => handleDragStart(e, element.id)}
                          onTouchStart={(e) => handleDragStart(e, element.id)}
                        >
                          <GripHorizontal className="w-4 h-4 text-white drop-shadow-lg" />
                        </div>
                        <div
                          className="absolute left-full ml-2 cursor-pointer"
                          onMouseDown={(e) => handleRotateStart(e, element.id)}
                          onTouchStart={(e) => handleRotateStart(e, element.id)}
                        >
                          <RotateCcw className="w-4 h-4 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    ))}
                </div>

                <Button onClick={downloadMeme} disabled={!image} className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Download Meme
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advertisement Section */}
        <div className="hidden xl:block w-80 shrink-0">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle>Advertisement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[300/600] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">Ad Space (300x600)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


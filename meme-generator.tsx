"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, GripHorizontal, Plus, Trash2, RotateCcw } from "lucide-react"
import { getAddress } from "@chopinframework/next";
 
const POPULAR_MEMES = [
  {
    name: "Drake",
    url: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Distracted Boyfriend",
    url: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Two Buttons",
    url: "/placeholder.svg?height=400&width=400",
  },
]

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  rotation: number
}

export default function MemeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fontSize, setFontSize] = useState(40)
  const [textColor, setTextColor] = useState("#ffffff")
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const lastMousePos = useRef<{ x: number; y: number } | null>(null)

  const addNewText = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: "New Text",
      x: image ? image.width / 2 : 200,
      y: image ? image.height / 2 : 200,
      rotation: 0,
    }
    setTextElements((prev) => [...prev, newElement])
  }

  const removeText = (id: string) => {
    setTextElements((prev) => prev.filter((el) => el.id !== id))
  }

  const updateText = (id: string, text: string) => {
    setTextElements((prev) => prev.map((el) => (el.id === id ? { ...el, text: text.toUpperCase() } : el)))
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
            },
            {
              id: "text-2",
              text: "BOTTOM TEXT",
              x: img.width / 2,
              y: img.height - 50,
              rotation: 0,
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
        },
        {
          id: "text-2",
          text: "BOTTOM TEXT",
          x: img.width / 2,
          y: img.height - 50,
          rotation: 0,
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
      ctx.fillStyle = textColor
      ctx.strokeStyle = "black"
      ctx.lineWidth = fontSize / 8
      ctx.textAlign = "center"
      ctx.font = `bold ${fontSize}px Impact`

      // Draw the text
      ctx.strokeText(element.text, 0, 0)
      ctx.fillText(element.text, 0, 0)

      // Restore the context state
      ctx.restore()
    })
  }, [image, textElements, fontSize, textColor])

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
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Meme Generator</CardTitle>
          <CardDescription>
            Upload an image or select a template. Add text, drag to position, and rotate!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-4">
              {POPULAR_MEMES.map((meme) => (
                <Button key={meme.name} variant="outline" onClick={() => selectTemplate(meme.url)}>
                  {meme.name}
                </Button>
              ))}
            </div>

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
            </div>
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
              <div key={element.id} className="grid gap-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`text-${element.id}`}>Text {index + 1}</Label>
                  <Button variant="ghost" size="sm" onClick={() => removeText(element.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  id={`text-${element.id}`}
                  value={element.text}
                  onChange={(e) => updateText(element.id, e.target.value)}
                  placeholder="Enter text"
                />
              </div>
            ))}

            <div className="grid gap-2">
              <Label>Font Size</Label>
              <Slider value={[fontSize]} onValueChange={(value) => setFontSize(value[0])} min={20} max={80} step={1} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="text-color">Text Color</Label>
              <Input
                type="color"
                id="text-color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-20 h-10"
              />
            </div>
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
            <Button onClick={downloadMeme} disabled={!image} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Download Meme
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


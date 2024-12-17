'use client'
import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'

function App() {
  const [svgFile, setSvgFile] = useState<File | null>(null)

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0]
    if (file && file.type === 'image/svg+xml') {
      setSvgFile(file)
    } else {
      alert('Please upload a valid SVG file.')
    }
  }

  const handleDownloadPdf = async (): Promise<void> => {
    if (!svgFile) return

    try {
      // Read SVG file content
      const svgText = await svgFile.text()

      // Create a new canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Failed to get canvas 2D context.')
      }

      const img = new Image()

      // Set up canvas size based on SVG dimensions
      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0, img.width, img.height)

        // Get the canvas as a PNG
        const pngUrl = canvas.toDataURL('image/png')

        // Create PDF using pdf-lib
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([img.width, img.height])

        // Embed PNG image into PDF
        const pngImage = await pdfDoc.embedPng(pngUrl)
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        })

        // Save PDF and trigger download
        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = 'converted-svg.pdf'
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      }

      // Set the SVG file data as the image source
      img.src = `data:image/svg+xml;base64,${btoa(svgText)}`
    } catch (error) {
      console.error('Error during PDF generation:', error)
    }
  }

  return (
    <div className="container">
      <h1>SVG to PDF Converter</h1>
      <input type="file" accept=".svg" onChange={handleFileUpload} />
      <button onClick={handleDownloadPdf} disabled={!svgFile}>
        Download as PDF
      </button>
    </div>
  )
}

export default App

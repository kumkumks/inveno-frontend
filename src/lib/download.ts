export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}
  
export function filenameFromDisposition(header: string | undefined, fallback: string) {
    const match = header?.match(/filename="?([^"]+)"?/i)
    return match?.[1] || fallback
}
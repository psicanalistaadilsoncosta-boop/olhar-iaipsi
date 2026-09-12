import { createClient } from '@/lib/supabase/server'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const supervisao_id = searchParams.get('id')
    if (!supervisao_id) return new Response('ID obrigatório', { status: 400 })

    const supabase = await createClient()

    const { data: sup } = await supabase
      .from('olhar_supervisoes')
      .select('*, olhar_respondentes(nome, email)')
      .eq('id', supervisao_id)
      .single()

    if (!sup) return new Response('Supervisão não encontrada', { status: 404 })

    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, BorderStyle } = await import('docx')

    const analise = sup.analise_editada || sup.analise_bruta || ''
    const nome = sup.olhar_respondentes?.nome || 'Paciente'
    const data = new Date(sup.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
    const abordagens = sup.abordagens?.join(', ') || 'Geral'

    function titulo(text) {
      return new Paragraph({
        text,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    }

    function subtitulo(text) {
      return new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    }

    function corpo(text) {
      return new Paragraph({
        children: [new TextRun({ text: text || '', size: 24, font: 'Calibri' })],
        spacing: { after: 120, line: 320 },
      })
    }

    function separador() {
      return new Paragraph({
        border: { bottom: { color: 'E8E4DE', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        spacing: { before: 200, after: 200 },
      })
    }

    function quebraPagina() {
      return new Paragraph({ children: [new PageBreak()] })
    }

    const children = []

    // CAPA
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Olhar', bold: true, size: 56, color: '1A2E25', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Análise de Supervisão', size: 32, color: '9A8E82', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Paragraph({
        children: [new TextRun({ text: nome, bold: true, size: 36, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: data, size: 22, color: '9A8E82', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Abordagens: ${abordagens}`, size: 22, color: 'C4732A', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      quebraPagina()
    )

    // MATERIAL DO CASO
    if (sup.texto_caso) {
      children.push(titulo('Material do caso'))
      sup.texto_caso.split('\n').forEach(linha => {
        if (!linha.trim()) {
          children.push(new Paragraph({ spacing: { after: 80 } }))
        } else if (linha.startsWith('══')) {
          children.push(subtitulo(linha.replace(/══/g, '').trim()))
        } else {
          children.push(corpo(linha))
        }
      })
      children.push(quebraPagina())
    }

    // ANÁLISE
    children.push(titulo('Análise de supervisão'))
    analise.split('\n').forEach(linha => {
      if (!linha.trim()) {
        children.push(new Paragraph({ spacing: { after: 80 } }))
      } else if (/^\d+\./.test(linha.trim())) {
        // Cabeçalho numerado (1. SÍNTESE, 2. CENAS...)
        children.push(new Paragraph({
          children: [new TextRun({ text: linha, bold: true, size: 26, color: '1A2E25', font: 'Calibri' })],
          spacing: { before: 300, after: 120 },
        }))
      } else if (linha.startsWith('---')) {
        children.push(separador())
      } else {
        children.push(corpo(linha))
      }
    })

    const doc = new Document({
      sections: [{ children }],
      styles: {
        default: {
          document: {
            run: { font: 'Calibri', size: 24 },
            paragraph: { spacing: { line: 320 } },
          },
        },
      },
    })

    const buffer = await Packer.toBuffer(doc)
    const nomeArquivo = `supervisao-${nome.toLowerCase().replace(/\s+/g, '-')}-${new Date(sup.created_at).toLocaleDateString('pt-BR').replace(/\//g, '-')}.docx`

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      },
    })
  } catch (err) {
    console.error('[supervisao-word]', err)
    return new Response('Erro: ' + err.message, { status: 500 })
  }
}
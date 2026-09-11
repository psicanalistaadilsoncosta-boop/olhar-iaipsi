import { createClient } from '@/lib/supabase/server'
import { QUESTIONS } from '@/lib/questions'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const respondente_id = searchParams.get('id')
    if (!respondente_id) return new Response('ID obrigatório', { status: 400 })

    const supabase = await createClient()

    const [{ data: respondente }, { data: devolutivas }, { data: sessoes }, { data: respostas }] = await Promise.all([
      supabase.from('olhar_respondentes').select('*').eq('id', respondente_id).single(),
      supabase.from('olhar_devolutivas').select('*').eq('respondente_id', respondente_id)
        .neq('status', 'rascunho').order('ciclo'),
      supabase.from('olhar_sessoes').select('*').eq('respondente_id', respondente_id)
        .order('data_sessao'),
      supabase.from('olhar_respostas').select('*').eq('respondente_id', respondente_id)
        .order('situacao_index'),
    ])

    if (!respondente) return new Response('Paciente não encontrado', { status: 404 })

    // Gera o Word via script Node.js inline
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, BorderStyle } = await import('docx')

    const puladas = respostas?.filter(r => r.pulada) || []
    const todasTags = {}
    devolutivas?.forEach(d => d.tags_ia?.forEach(tag => {
      todasTags[tag] = (todasTags[tag] || 0) + 1
    }))

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

    function corpo(text, italico = false) {
      return new Paragraph({
        children: [new TextRun({ text: text || '', italics: italico, size: 24, font: 'Calibri' })],
        spacing: { after: 120, line: 320 },
      })
    }

    function label(text) {
      return new Paragraph({
        children: [new TextRun({ text, bold: true, size: 22, color: 'C4732A', font: 'Calibri' })],
        spacing: { before: 160, after: 60 },
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
        children: [new TextRun({ text: 'Relatório de Evolução', size: 32, color: '9A8E82', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Paragraph({
        children: [new TextRun({ text: respondente.nome || 'Paciente', bold: true, size: 36, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: respondente.email || '', size: 22, color: '9A8E82', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: `${devolutivas?.length || 0} ciclos · desde ${new Date(respondente.created_at).toLocaleDateString('pt-BR')}`,
          size: 22, color: 'C4732A', font: 'Calibri'
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      }),
      quebraPagina()
    )

    // 1. PERFIL CLÍNICO
    children.push(titulo('1. Perfil clínico'))
    const ciclo1 = devolutivas?.find(d => d.ciclo === 1)
    if (ciclo1?.analise_ia) {
      children.push(corpo(ciclo1.analise_ia))
    }
    if (ciclo1?.tags_ia?.length) {
      children.push(label('Padrões identificados'))
      children.push(corpo(ciclo1.tags_ia.join(' · ')))
    }
    children.push(quebraPagina())

    // 2. EVOLUÇÃO POR CICLO
    children.push(titulo('2. Evolução ciclo a ciclo'))

    devolutivas?.forEach(d => {
      children.push(subtitulo(`Ciclo ${d.ciclo}`))

      if (d.enunciado_final) {
        children.push(label('Devolutiva enviada'))
        children.push(corpo(d.enunciado_final, true))
      }

      if (d.analise_ia) {
        children.push(label('Análise clínica (IA)'))
        children.push(corpo(d.analise_ia))
      }

      if (d.resposta_paciente) {
        children.push(label('Como soou para o paciente'))
        children.push(corpo(`"${d.resposta_paciente}"`, true))
      }

      if (d.observacoes_paciente) {
        children.push(label('Observações do paciente'))
        children.push(corpo(d.observacoes_paciente))
      }

      if (d.acoes?.length) {
        children.push(label('Ações enviadas'))
        d.acoes.forEach((acao, i) => {
          const resp = d.acoes_respondidas?.[i]
          const status = resp?.opcao === 'fiz' ? '✓ Fiz' :
            resp?.opcao === 'tentei' ? '~ Tentei' :
            resp?.opcao === 'nao_consegui' ? '✗ Não consegui' :
            resp?.opcao === 'nao_tentei' ? '○ Ainda não tentei' : '— Não respondeu'
          children.push(corpo(`${acao.tipo}: ${acao.texto} [${status}]`))
          if (resp?.observacao) children.push(corpo(`  → ${resp.observacao}`, true))
        })
      }

      if (d.nota_supervisor) {
        children.push(label('Nota do supervisor'))
        children.push(corpo(d.nota_supervisor))
      }

      // Sessão neste ciclo
      const sessoesNoCiclo = sessoes?.filter(s =>
        s.status === 'realizada' &&
        new Date(s.data_sessao) <= new Date(d.enviada_at || Date.now())
      ) || []
      if (sessoesNoCiclo.length) {
        children.push(label('Sessões realizadas neste período'))
        sessoesNoCiclo.forEach(s => {
          children.push(corpo(`${new Date(s.data_sessao).toLocaleDateString('pt-BR')} — ${s.tipo}`))
          if (s.notas) children.push(corpo(s.notas, true))
        })
      }

      children.push(separador())
    })

    children.push(quebraPagina())

    // 3. SITUAÇÕES EM PAUSA
        if (puladas.length > 0) {
      children.push(titulo('3. Situações em pausa'))

      // Verifica quais foram respondidas em ciclos posteriores
      const respondidasPosteriormente = new Set()
      devolutivas?.forEach(d => {
        d.situacoes_retomadas?.forEach((s, i) => {
          const resp = d.respostas_situacoes_retomadas?.[i]
          if (resp && resp !== '__PULAR__' && resp !== '') {
            respondidasPosteriormente.add(s.situacao_index)
          }
        })
      })

      const aindaPuladas = puladas.filter(r => !respondidasPosteriormente.has(r.situacao_index))
      const respondidaDepois = puladas.filter(r => respondidasPosteriormente.has(r.situacao_index))

      if (respondidaDepois.length > 0) {
        children.push(subtitulo('Respondidas em ciclos posteriores'))
        respondidaDepois.forEach(r => {
          const q = QUESTIONS[r.situacao_index]
          children.push(label(`Situação ${r.situacao_index + 1} — ${r.bloco}`))
          if (q?.text) children.push(corpo(q.text, true))
          // Busca a resposta
          devolutivas?.forEach(d => {
            d.situacoes_retomadas?.forEach((s, i) => {
              if (s.situacao_index === r.situacao_index) {
                const resp = d.respostas_situacoes_retomadas?.[i]
                if (resp && resp !== '__PULAR__') {
                  children.push(corpo(`Resposta (ciclo ${d.ciclo}): "${resp}"`, true))
                }
              }
            })
          })
        })
        children.push(separador())
      }

            if (aindaPuladas.length > 0) {
        children.push(subtitulo('Ainda sem resposta'))
        aindaPuladas.forEach(r => {
          const q = QUESTIONS[r.situacao_index]
          children.push(label(`Situação ${r.situacao_index + 1} — ${r.bloco}`))
          if (q?.text) children.push(corpo(q.text, true))
          devolutivas?.forEach(d => {
            d.situacoes_puladas?.forEach(s => {
              if (s.situacao_index === r.situacao_index && s.hipotese) {
                children.push(corpo(`Hipótese clínica: ${s.hipotese}`))
              }
            })
          })
        })
      }

      children.push(quebraPagina())
    }

    // 4. PADRÕES RECORRENTES
    if (Object.keys(todasTags).length > 0) {
      children.push(titulo('4. Padrões recorrentes'))
      Object.entries(todasTags)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tag, count]) => {
          children.push(corpo(`${tag} — aparece em ${count} ciclo${count > 1 ? 's' : ''}`))
        })
      children.push(quebraPagina())
    }

    // 5. NOTAS DE SESSÕES
    const sessoesRealizadas = sessoes?.filter(s => s.status === 'realizada' && s.notas) || []
    if (sessoesRealizadas.length > 0) {
      children.push(titulo('5. Notas de sessões'))
      sessoesRealizadas.forEach(s => {
        children.push(label(new Date(s.data_sessao).toLocaleDateString('pt-BR', {
          weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
        })))
        children.push(corpo(s.notas))
        children.push(separador())
      })
    }

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

    const nomeArquivo = `olhar-${(respondente.nome || 'paciente').toLowerCase().replace(/\s+/g, '-')}.docx`

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      },
    })
  } catch (err) {
    console.error('[relatorio-word]', err)
    return new Response('Erro ao gerar relatório: ' + err.message, { status: 500 })
  }
}
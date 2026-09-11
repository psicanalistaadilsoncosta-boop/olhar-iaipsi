'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const TIPOS = { online: 'Online', presencial: 'Presencial' }
const STATUS_COR = {
  agendada:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  label: 'Agendada' },
  realizada:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: 'Realizada' },
  cancelada:  { bg: 'bg-stone-50',  text: 'text-stone-400',  border: 'border-stone-200',  label: 'Cancelada' },
}

export default function SessoesPage() {
  const supabase = createClient()
  const [sessoes, setSessoes] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [modalNotas, setModalNotas] = useState(null)
  const [form, setForm] = useState({ respondente_id: '', data_sessao: '', tipo: 'online', fuso_paciente: 'America/Sao_Paulo' })
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('olhar_sessoes').select('*, olhar_respondentes(nome)')
        .eq('analista_id', user.id)
        .order('data_sessao', { ascending: false }),
      supabase.from('olhar_respondentes').select('id, nome')
        .eq('analista_id', user.id)
        .neq('status', 'encerrado'),
    ])
    setSessoes(s || [])
    setPacientes(p || [])
    setLoading(false)
  }

  async function handleAgendar(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
           // Converte horário de Brasília para UTC antes de salvar
      const dataBrasilia = new Date(form.data_sessao + ':00-03:00')
      
      const { error } = await supabase.from('olhar_sessoes').insert({
        ...form,
        data_sessao: dataBrasilia.toISOString(),
        analista_id: user.id,
        status: 'agendada',
      })
      if (error) throw error

      // Atualiza proxima_sessao no respondente
      await supabase.from('olhar_respondentes')
        .update({ proxima_sessao: form.data_sessao })
        .eq('id', form.respondente_id)

      setModal(false)
      setForm({ respondente_id: '', data_sessao: '', tipo: 'online' })
      await load()
    } catch (err) {
      alert('Erro ao agendar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function marcarRealizada(sessao) {
    setModalNotas(sessao)
    setNotas(sessao.notas || '')
  }

  async function salvarNotas() {
    setSaving(true)
    try {
      const { error } = await supabase.from('olhar_sessoes')
        .update({ status: 'realizada', notas })
        .eq('id', modalNotas.id)
      if (error) throw error
      setModalNotas(null)
      setNotas('')
      await load()
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function cancelar(id) {
    if (!confirm('Cancelar esta sessão?')) return
    await supabase.from('olhar_sessoes').update({ status: 'cancelada' }).eq('id', id)
    await load()
  }

  const proximas = sessoes.filter(s => s.status === 'agendada')
  const anteriores = sessoes.filter(s => s.status !== 'agendada')

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-stone-800 mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
            Sessões
          </h1>
          <p className="text-sm text-stone-400 font-light">
            Sessões ao vivo agendadas e realizadas
          </p>
        </div>
        <button onClick={() => setModal(true)}
          className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:-translate-y-0.5"
          style={{ background: '#C4732A' }}>
          + Agendar sessão
        </button>
      </div>

      {loading ? (
        <div className="text-stone-400 text-sm font-light">Carregando...</div>
      ) : (
        <>
          {/* Próximas */}
          {proximas.length > 0 && (
            <section className="mb-8">
              <h2 className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-3">
                Próximas sessões
              </h2>
              <div className="flex flex-col gap-2">
                {proximas.map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-stone-200 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-light text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {new Date(s.data_sessao).toLocaleDateString('pt-BR', { day: '2-digit' })}
                        </div>
                        <div className="text-[11px] text-stone-400 uppercase tracking-wide">
                          {new Date(s.data_sessao).toLocaleDateString('pt-BR', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-stone-800">
                          {s.olhar_respondentes?.nome || 'Sem nome'}
                        </div>
                                                <div className="text-xs text-stone-400 font-light">
                          {new Date(s.data_sessao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })} Brasília
                          {s.fuso_paciente && s.fuso_paciente !== 'America/Sao_Paulo' && (
                            <span className="ml-2 text-amber-600">
                              · {new Date(s.data_sessao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: s.fuso_paciente })} paciente
                            </span>
                          )}
                          {' · '}{TIPOS[s.tipo]}
                        </div>
                      </div>
                    </div>
                      <div className="flex items-center gap-2">
                      {s.confirmacao === 'confirmada' && (
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">✓ Confirmado</span>
                      )}
                      {s.confirmacao === 'reagendar' && (
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">⚠ Quer reagendar</span>
                      )}
                      <button onClick={() => marcarRealizada(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                        Registrar notas
                      </button>
                      <button onClick={() => cancelar(s.id)}
                        className="text-xs px-3 py-1.5 rounded-full border border-stone-200 text-stone-400 hover:bg-stone-50 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Anteriores */}
          {anteriores.length > 0 && (
            <section>
              <h2 className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-3">
                Histórico
              </h2>
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                {anteriores.map((s, i) => {
                  const cor = STATUS_COR[s.status]
                  return (
                    <div key={s.id} className={`px-5 py-3.5 flex items-center justify-between ${i < anteriores.length - 1 ? 'border-b border-stone-100' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-sm text-stone-700">
                            {s.olhar_respondentes?.nome || 'Sem nome'}
                          </div>
                          <div className="text-xs text-stone-400 font-light">
                            {new Date(s.data_sessao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })} · {TIPOS[s.tipo]}
                          </div>
                          {s.notas && (
                            <div className="text-xs text-stone-500 font-light mt-1 max-w-md truncate">
                              {s.notas}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${cor.bg} ${cor.text} ${cor.border}`}>
                        {cor.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {sessoes.length === 0 && (
            <div className="text-center py-16 text-stone-400 text-sm font-light">
              Nenhuma sessão agendada ainda.
            </div>
          )}
        </>
      )}

      {/* Modal agendar */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg text-stone-800 mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              Agendar sessão
            </h2>
            <form onSubmit={handleAgendar} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">Paciente</label>
                <select value={form.respondente_id} onChange={e => setForm(f => ({ ...f, respondente_id: e.target.value }))}
                  required className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-amber-400 bg-white font-light">
                  <option value="">Selecione...</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">Data e hora</label>
                <input type="datetime-local" value={form.data_sessao}
                  onChange={e => setForm(f => ({ ...f, data_sessao: e.target.value }))}
                  required className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-amber-400 font-light" />
              </div>
                            <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">Tipo</label>
                <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-amber-400 bg-white font-light">
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">
                  Fuso horário do paciente
                </label>
                <select value={form.fuso_paciente} onChange={e => setForm(f => ({ ...f, fuso_paciente: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-amber-400 bg-white font-light">
                  <option value="America/Sao_Paulo">Brasil — Brasília/SP (mesmo fuso)</option>
                  <option value="America/Manaus">Brasil — Manaus (−1h de Brasília)</option>
                  <option value="America/New_York">EUA — Nova York / Miami (−1h ou −2h conforme horário de verão)</option>
                  <option value="America/Chicago">EUA — Chicago (−3h de Brasília)</option>
                  <option value="America/Denver">EUA — Denver (−4h de Brasília)</option>
                  <option value="America/Los_Angeles">EUA — Los Angeles (−5h de Brasília)</option>
                  <option value="Europe/Lisbon">Portugal — Lisboa (−3h de Brasília)</option>
                  <option value="Europe/London">Reino Unido — Londres (−3h de Brasília)</option>
                  <option value="Europe/Paris">Europa Central — Paris/Berlim (−2h de Brasília)</option>
                </select>
              </div>
              <div className="bg-stone-50 rounded-xl px-4 py-3 text-xs text-stone-500 font-light">
                O horário que você digitar acima é sempre no <strong>horário de Brasília (SP)</strong>. O sistema calcula automaticamente o horário do paciente no fuso selecionado.
              </div>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                  style={{ background: '#1A2E25' }}>
                  {saving ? 'Agendando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal notas */}
      {modalNotas && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg text-stone-800 mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              Notas da sessão
            </h2>
            <p className="text-xs text-stone-400 mb-4 font-light">
              {modalNotas.olhar_respondentes?.nome} · {new Date(modalNotas.data_sessao).toLocaleDateString('pt-BR')}
            </p>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              rows={6} placeholder="O que foi trabalhado, o que surgiu, pontos de atenção..."
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-700 font-light leading-relaxed resize-none outline-none focus:border-amber-400 mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setModalNotas(null)}
                className="flex-1 py-3 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors">
                Cancelar
              </button>
              <button onClick={salvarNotas} disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                style={{ background: '#1A2E25' }}>
                {saving ? 'Salvando...' : 'Marcar como realizada'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
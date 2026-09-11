'use client'

import InputText from './InputText'
import { InputCards, InputSelect, InputScale } from './InputOptions'

export default function QuestionCard({ question, answer, skipped, onAnswer, onSkip }) {
  const { text, type, options, labels, placeholder } = question

  function renderInput() {
    if (skipped) {
      return (
        <div className="opacity-30 pointer-events-none">
          {renderInputInner()}
        </div>
      )
    }
    return renderInputInner()
  }

  function renderInputInner() {
    switch (type) {
      case 'text':
        return (
          <InputText
            value={answer}
            onChange={onAnswer}
            placeholder={placeholder}
            disabled={skipped}
          />
        )
      case 'images':
        return (
          <InputCards
            options={options}
            value={answer}
            onChange={onAnswer}
            disabled={skipped}
          />
        )
      case 'select':
        return (
          <InputSelect
            options={options}
            value={answer}
            onChange={onAnswer}
            disabled={skipped}
          />
        )
      case 'scale':
        return (
          <InputScale
            labels={labels}
            value={answer}
            onChange={onAnswer}
            disabled={skipped}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* texto da situação */}
      <p
        className="
          font-playfair text-xl text-stone-100 leading-relaxed
          max-w-lg
        "
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {text}
      </p>

      {/* input */}
      {renderInput()}

      {/* pular */}
      <button
        type="button"
        onClick={onSkip}
        className={`
          text-xs font-light text-center transition-colors
          ${skipped
            ? 'text-amber-600/80'
            : 'text-stone-100/30 hover:text-stone-100/60'
          }
        `}
      >
        {skipped
          ? '✓ Pulando esta situação — clique para desfazer'
          : 'Prefiro não comentar isso agora'}
      </button>
    </div>
  )
}

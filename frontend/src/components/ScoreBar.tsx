interface Props {
  score: number
  size?: 'sm' | 'md'
}

export function ScoreBar({ score, size = 'md' }: Props) {
  const h = size === 'sm' ? 3 : 4
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1,
        height: h,
        background: 'var(--border-mid)',
        borderRadius: 99,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: 'var(--accent)',
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{
        fontFamily: 'DM Mono',
        fontSize: size === 'sm' ? 10 : 12,
        fontWeight: 500,
        color: 'var(--accent)',
        minWidth: 28,
        textAlign: 'right',
        letterSpacing: '0.04em',
      }}>
        {score.toFixed(0)}
      </span>
    </div>
  )
}

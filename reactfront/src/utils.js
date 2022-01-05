
export function voltsToPsi(volts, barMax) {
  const resistance = 120; // ohm
  const current1 = 0.004; // amps
  const current2 = 0.02; // amps
  const bar = barMax/(resistance * current2) * (volts - resistance * current1)
  return bar * 14.504; // 1bar = 14.5psi
}

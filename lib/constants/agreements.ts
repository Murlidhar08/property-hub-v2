export const AGREEMENT_TYPES = [
  { id: 1, name: "Sale Agreement" },
  { id: 2, name: "Rent Agreement" },
  { id: 3, name: "Lease Agreement" },
];

export function getAgreementTypeName(typeId: number): string {
  const type = AGREEMENT_TYPES.find((t) => t.id === typeId);
  return type ? type.name : `Agreement Type ${typeId}`;
}

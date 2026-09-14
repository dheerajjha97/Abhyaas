import React from 'react';
import { AnswerRenderer, AnswerRendererProps } from './AnswerRenderer';

export type FormattedAnswerProps = AnswerRendererProps;

/**
 * FormattedAnswer:
 * Delegates to the unified AnswerRenderer for high-precision academic rendering:
 * - Hierarchical Roman Numeral Main Sections ((I), (II) -> ①, ②)
 * - Nested Sub-points ((i), (ii) -> 1., 2.)
 * - Automatic comparison detection with interactive comparison table toggle
 * - Emphasized textbook keywords (उत्पत्ति, कार्य, उपस्थिति, उदाहरण, etc.)
 * - Formulas, equations, callouts and Devanagari typography
 */
export const FormattedAnswer: React.FC<FormattedAnswerProps> = (props) => {
  return <AnswerRenderer {...props} />;
};

export { AnswerRenderer };

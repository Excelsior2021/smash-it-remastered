import { beforeEach } from "node:test"
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity"
import { mockDeep, mockReset } from "vitest-mock-extended"

const obscenity = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
})

beforeEach(() => {
  mockReset(obscenity)
})

export default mockDeep<RegExpMatcher>()

import { TestBed } from '@angular/core/testing';

import { CifradoSimetrico } from './cifrado-simetrico';

describe('CifradoSimetrico', () => {
  let service: CifradoSimetrico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CifradoSimetrico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

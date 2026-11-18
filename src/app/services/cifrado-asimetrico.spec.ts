import { TestBed } from '@angular/core/testing';

import { CifradoAsimetrico } from './cifrado-asimetrico';

describe('CifradoAsimetrico', () => {
  let service: CifradoAsimetrico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CifradoAsimetrico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

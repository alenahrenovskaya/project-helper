import { Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { debounceTime, map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';

import { EntitiesParams, IDefaultResponse } from './get-entities.model';
import { isCancelSearch } from '../../functions/isCanselSearch';
import { GetEntitiesService } from './get-entities.service';
import { isOnChanges } from '../../functions/isOnChanges';
import { DefaultParams } from '../../default-classes';


@Directive({
  selector: '[entitiesParams]'
})
export class GetEntitiesDirective<T> implements OnChanges {
  @Input() entitiesParams: EntitiesParams<T>;
  @Input() entitiesSearch: string;
  @Input() entitiesResult: string = 'results';

  @Output() getEntities: EventEmitter<Observable<T[]>> = new EventEmitter<Observable<T[]>>();
  @Output() countChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() responseChange: EventEmitter<IDefaultResponse<T>> = new EventEmitter<IDefaultResponse<T>>();

  constructor(private getEntitiesService: GetEntitiesService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (isOnChanges(changes.entitiesParams) || isOnChanges(changes.entitiesSearch) || isCancelSearch(changes.entitiesSearch)) {
      this.getEntities.emit(this.getDictionary());
    }
  }

  getDictionaryParams(): DefaultParams {
    const params: DefaultParams = this.entitiesParams.params ? this.entitiesParams.params : {};
    if (this.entitiesParams.field) {
      params[this.entitiesParams.field] = this.entitiesSearch;
    }

    return params;
  }

  emitResponse(response: IDefaultResponse<T>): void {
    this.responseChange.emit(response);
    this.countChange.emit(response.count);
  }

  prepareAndEmitResponse(response: IDefaultResponse<T>): T[] {
    if (this.entitiesParams.cls) {
      response[this.entitiesResult] = plainToClass(this.entitiesParams.cls, response[this.entitiesResult]);
    }
    this.emitResponse(response);

    return response[this.entitiesResult];
  }

  getDictionary(): Observable<T[]> {
    const params = this.getDictionaryParams();

    return this.getEntitiesService.getEntities<T>(this.entitiesParams.url, params)
      .pipe(
        debounceTime(500),
        map((response: IDefaultResponse<T>) => this.prepareAndEmitResponse(response))
      );
  }
}

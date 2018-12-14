import { Component, ViewChild, ViewContainerRef, AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { INewsItem } from 'src/app/core/newsBackend/common/INewsItem';
import { INewsListService } from '../common/INewsListService';
import { takeUntil, map, withLatestFrom, first, concatMap, filter, mapTo } from 'rxjs/operators';
import { IPageParams } from '../common/IWhenPublishPageParams';
import { IAppContainerService } from 'src/app/router/common/IAppContainerService';
import { INotification } from 'src/app/core/notificationService/INotification';
import { IConfirmData } from 'src/app/shared/confirmModal/IConfirmData';
@Component({
  selector: 'app-news-list',
  templateUrl: './newsList.template.html',
  styleUrls: [
    './newsList.style.sass'
  ]
})

class NewsListComponent implements AfterViewInit, OnDestroy {
  @ViewChild('paginationContainer', { read: ViewContainerRef })
  public paginationContainer: ViewContainerRef;

  public sortList: Array<{
    title: string, field: string, order: string
  }> =
    [
      { title: 'По дате публикации', field: 'datePublication'},
      { title: 'По активности', field: null}
    ].map(x => ([
        { ...x, order: 'asc' },
        { ...x, order: 'desc'}
    ]))
    .reduce((prev, curr) => [...prev, ...curr]);

  public isShowAll$: Subject<boolean> =
    new BehaviorSubject(false);

  public selectedSort$: Subject<{
    title: string, field: string, order: string
  }> = new BehaviorSubject(this.sortList[0]);

  public pageParams$: Observable<IPageParams>;

  public isEditMode$: Observable<boolean>;

  private newsList$: Subject<Array<INewsItem>> =
    new Subject();

  private whenDestoryComponet$: Subject<null> =
    new Subject();

  private whenEditNews$: Subject<INewsItem> =
    new Subject();
  private whenRemoveNews$: Subject<INewsItem> =
    new Subject();

  public filtredNews$: Observable<Array<INewsItem>> =
    combineLatest(this.isShowAll$, this.newsList$)
    .pipe(
      takeUntil(this.whenDestoryComponet$),
      map(([isShowAll, list]) => isShowAll ? list : list.filter(x => x.active))
    );
  constructor(
    private newsListService: INewsListService,
    private injector: Injector,
    private appService: IAppContainerService,
    private notify: INotification
  ) {
    this.newsListService.getNews()
      .pipe(first())
      .subscribe(x => this.newsList$.next(x));

    this.pageParams$ =
      this.newsListService.whenGetPageParams$
        .pipe(takeUntil(this.whenDestoryComponet$));

    this.isEditMode$ =
      this.appService.isEditMode$
        .pipe(takeUntil(this.whenDestoryComponet$));

    this.whenEditNews$
      .pipe(
        takeUntil(this.whenDestoryComponet$),
        concatMap(x => this.newsListService.onEditNews(x))
      )
      .subscribe(x => {
        this.notify.openNotification('Изменения успешно сохранены');
        this.newsList$.next(x);
      });

    this.whenRemoveNews$
      .pipe(
        map(item => ({
          confirmData: this.getConfirmData(item),
          item
        })),
        concatMap(({confirmData, item}) =>
          this.appService.openConfirmModal(confirmData)
            .pipe(
              filter(isConfirm => isConfirm),
              mapTo(item)
            )
        ),
        withLatestFrom(this.newsList$),
        map(([item, news]) => news.filter(x => x.idArticle !== item.idArticle))
      )
      .subscribe(x => {
        this.notify.openNotification('Изменения успешно сохранены');
        this.newsList$.next(x);
      });
  }

  public ngAfterViewInit(): void {
    const countElements: Observable<number> =
      this.getCountShowNews();

    this.newsListService.renderPaginaton(
      this.paginationContainer,
      this.injector,
      countElements
    );
  }

  public ngOnDestroy(): void {
    this.whenDestoryComponet$.next(null);
    this.whenDestoryComponet$.complete();
  }
  public onChangeActivity(isActive: boolean): void {
    this.isShowAll$.next(isActive);
  }

  public onChangeSort(sortValue: {
    title: string, field: string, order: string
  }): void {
    this.selectedSort$.next(sortValue);
  }

  public onClickEdit(item: INewsItem): void {
    this.whenEditNews$.next(item);
  }

  public onClickRemove(item: INewsItem): void {
   this.whenRemoveNews$.next(item);
  }
  private getCountShowNews = (): Observable<number> =>
    this.filtredNews$.pipe(
      takeUntil(this.whenDestoryComponet$),
      map(x => x.length)
    )

  private getConfirmData = (item: INewsItem): IConfirmData =>
    ({
      title: `Удаление статьи ${item.name}`,
      text: `Подтвердите удаление статьи №${item.idArticle}.
      Дополнительная информация:
        - Наименование '${item.name}'
        - Автор ${item.author}
      `
    })
}

export { NewsListComponent };

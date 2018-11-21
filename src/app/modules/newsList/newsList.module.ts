import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TopNewsComponent } from '../topNews/topNews.component';
import { NewsComponent } from 'src/app/router/news/news.component';
import { NewsListComponent } from './newsList.component';
import { ActivityFilterPipe } from './common/activityFilter.pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { SortNewsPipe } from './common/sortNews.pipe';
import { FormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
  ],
  declarations: [
    TopNewsComponent,
    NewsComponent,
    NewsListComponent,
    ActivityFilterPipe,
    SortNewsPipe
  ],
})

export class NewsListModule {}
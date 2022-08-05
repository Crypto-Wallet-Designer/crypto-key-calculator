#include <stdio.h>
#include <bitset>
#include <time.h>
#include <math.h>
#include <stdlib.h>

using namespace std;

namespace bf{
	
	#define ull unsigned long long

	double p[7][5],pa[65],pb[65];
	double prb[65][65];
	ull st_set[8000005],pattern;
	bool acc[65];
	
	double maxn=-1.0;
	int n,num;
	
	double glb_maxn=-1;
	ull glb_pat=0;
	
	void enumerate(int cur,ull sta){
		if (cur==(1<<n)){
			st_set[++num]=sta;
			return;
		}
		int tag=0;
		for (int i=0;i<n;i++){
			if ((cur&(1<<i))&&(sta&(1ull<<(cur^(1<<i))))){
				tag=1;
				break;
			}
		}
		sta|=(1ull<<cur);
		enumerate(cur+1,sta);
		if (!tag){
			sta^=(1ull<<cur);
			enumerate(cur+1,sta);
		}
	}
	
	
	inline void check(){
		
		int ac[65],rj[65];
		
		double maxn=-1.0;
		ull pattern=0;
		
		for (int i=1;i<=num;i++){
			int n1=0,n2=0;
			for (int j=0;j<(1<<n);j++){
				if (st_set[i]&(1ull<<j)){
					ac[++n1]=j;
				}
				else{
					rj[++n2]=j;
				}
			}
			double ans=0.0;
			for (int j=1;j<=n1;j++){
				for (int k=1;k<=n2;k++){
					ans+=prb[ac[j]][rj[k]];
				}
			}
			if (ans>maxn){
				maxn=ans;
				pattern=st_set[i];
			}
		}
		
		glb_maxn=maxn;
		glb_pat=pattern;
		
		return;
		
	}
	
	inline void op_pattern(ull pattern){
		printf ("return ");
		int cnt=0;
		if (pattern&1ull){
			puts("true;");
			return;
		}
		
		for (int i=0;i<(1<<n);i++){
			if (!(pattern&(1ull<<i))){
				continue;
			}
			acc[i]=1;
			int tag=0;
			for (int j=i&(i-1);j;j=(j-1)&i){
				if (acc[j]){
					tag=1;
					break;
				}
			}
			if (tag){
				continue;
			}
			if (cnt) printf (" || ");
			cnt++;
			printf ("(");
			int cot=0;
			for (int j=0;j<n;j++){
				if (i&(1<<j)){
					if (cot){
						printf (" && ");
					}
					cot++;
					printf ("k[%d]",j+1);
				}
			}
			printf (")");
		}
		puts(";");
	}
	
	inline void work(int num){
		
		n=num;
	
		for (int i=0;i<n;i++){
			for (int j=0;j<4;j++){
				int x;
				scanf ("%d",&x);
				p[i][j]=0.01*x;
			}
		}
		
		for (int i=0;i<(1<<(2*n));i++){
			int na=0,nb=0;
			double prob=1.0;
			for (int j=0;j<2*n;j+=2){
				int sta=0;
				if (i&(1<<j)){
					sta|=1;
				}
				if (i&(1<<(j+1))){
					sta|=2;
				}
				if (sta==0||sta==1){
					na|=(1<<(j>>1));
				}
				if (sta==1||sta==3){
					nb|=(1<<(j>>1));
				}
				prob*=p[(j>>1)][sta];
			}
			prb[na][nb]+=prob;
		}
		
		enumerate(0,0);
		check();
		printf ("Successful Rate: %.6lf\n",glb_maxn);
		op_pattern(glb_pat);
	}
	
	
}
namespace sa{
	
	#define N 12
	
	const double search_time = 10.0;
	
	const int SZ=(1<<N);
	int que[SZ+1];
	double p[N+1][5];
	double prb[SZ+1][SZ+1];
	int n;
		
	
	inline bitset <SZ> get_init_state(){
		
		bitset <SZ> sta;
		
		for (int cur=0; cur<(1<<n); cur++){
			
			
			int o=rand()&255;
			
			if (o>100){
				int tag=0;
			    for (int i=0;i<n;i++){
					if ((cur&(1<<i))&&(sta[cur^(1<<i)])){
						tag=1;
						break;
					}
				}
				if (tag){
					sta[cur]=true;
				}
				else{
					sta[cur]=false;
				}
			}
			else{
				sta[cur]=true;
			}
			
		}
		
		return sta;
	}
	
	int ac[SZ+1],rj[SZ+1];
	
	inline double evaluate(bitset <SZ> sta){
		int n1=0,n2=0;
		for (int j=0;j<(1<<n);j++){
			if (sta[j]){
				ac[++n1]=j;
			}
			else{
				rj[++n2]=j;
			}
		}
		double ans=0.0;
		for (int j=1;j<=n1;j++){
			for (int k=1;k<=n2;k++){
				ans+=prb[ac[j]][rj[k]];
			}
		}
		return ans;
	}
	
	
	inline bitset <SZ> get_next(bitset <SZ> sta){
		
		int pos=rand()&((1<<n)-1);
		
		int l=1,r=0;
		
		if (sta[pos]){
			sta[pos]=false;
			que[++r]=pos;
			while (l<=r){
				int p=que[l++];
				for (int i=0;i<n;i++){
					if (p&(1<<i)){
					 	if (sta[p^(1<<i)]){
						 	sta[p^(1<<i)]=false;
							que[++r]=(p^(1<<i));
						}
					}
				}
			}
			return sta;
		}
		
		sta[pos]=true;
		que[++r]=pos;
		while (l<=r){
			int p=que[l++];
			for (int i=0;i<n;i++){
				if (!(p&(1<<i))){
					if (!sta[p^(1<<i)]){
						sta[p^(1<<i)]=true;
						que[++r]=(p^(1<<i));
					}
				}
			}
		}
		return sta;
			
	}
	
	bool acc[SZ+1];
	
	inline void op_pattern(bitset <SZ> pattern){
		printf ("return ");
		int cnt=0;
		if (pattern[0]){
			puts("true;");
			return;
		}
		
		for (int i=0;i<(1<<n);i++){
			if (!pattern[i]){
				continue;
			}
			acc[i]=1;
			int tag=0;
			for (int j=i&(i-1);j;j=(j-1)&i){
				if (acc[j]){
					tag=1;
					break;
				}
			}
			if (tag){
				continue;
			}
			if (cnt) printf (" || ");
			cnt++;
			printf ("(");
			int cot=0;
			for (int j=0;j<n;j++){
				if (i&(1<<j)){
					if (cot){
						printf (" && ");
					}
					cot++;
					printf ("k[%d]",j+1);
				}
			}
			printf (")");
		}
		puts(";");
	}
		
	
	void simulated_annealing(){
		
		bitset <SZ> cur_sta,bst_sta,new_sta;
		
		cur_sta=get_init_state();
		bst_sta=cur_sta;
		
		double cur_accuracy=evaluate(cur_sta);
		double max_accuracy=cur_accuracy;
		
		srand(233);
		
		double ts=clock(), T=1.0;
		
		double rat=0.999;
		
		switch (n){
			case 11: rat=0.99;break;
			case 12: rat=0.95;break;
			default: rat=0.999;break;
		}
			
		
		while (((double)(clock()-ts))/CLOCKS_PER_SEC < search_time){
			
			T*=rat;
			
			if (max_accuracy-cur_accuracy>0.15){
				cur_sta=bst_sta;
				cur_accuracy=max_accuracy;
			}
				
			
			new_sta=get_next(cur_sta);
			
			double tp=evaluate(new_sta);
			
			if (tp>max_accuracy){
				max_accuracy=tp;
				cur_sta=new_sta;
				bst_sta=new_sta;
				continue;
			}
			
			double del=tp-cur_accuracy;
			double prob=exp(del/T);
			double samp=((rand()&32767)+0.5)/32768.0;
			
			if (samp<prob){
				cur_accuracy=tp;
				cur_sta=new_sta;
				continue;
			}
		}
		
		printf ("Successful Rate: %.6lf\n",cur_accuracy);
		op_pattern(bst_sta);
		
			
		
		return;
	}
	
	inline void work(int num){
		
		n=num;
		
		for (int i=0;i<n;i++){
			for (int j=0;j<4;j++){
				int x;
				scanf ("%d",&x);
				p[i][j]=0.01*x;
			}
		}
		
		for (int i=0;i<(1<<(2*n));i++){
			int na=0,nb=0;
			double prob=1.0;
			for (int j=0;j<2*n;j+=2){
				int sta=0;
				if (i&(1<<j)){
					sta|=1;
				}
				if (i&(1<<(j+1))){
					sta|=2;
				}
				if (sta==0||sta==1){
					na|=(1<<(j>>1));
				}
				if (sta==1||sta==3){
					nb|=(1<<(j>>1));
				}
				prob*=p[(j>>1)][sta];
			}
			prb[na][nb]+=prob;
		}
		
		simulated_annealing();
		return;
	}
	
}


	
	

int main (){
	
	int n;
	
	scanf ("%d",&n);
	
	if (!(n>=1&&n<=12)){
		return 0;
	}
	
	if (n<=6){
		bf::work(n);
	}
	else{
		sa::work(n);
	}
	
	return 0;
}

/*

test case:

6
90 10 0 0
50 30 20 0
40 40 10 10
80 0 0 20
70 15 5 10
70 5 10 15

12
90 10 0 0
50 30 20 0
40 40 10 10
80 0 0 20
70 15 5 10
70 5 10 15
90 10 0 0
50 30 20 0
40 40 10 10
80 0 0 20
70 15 5 10
70 5 10 15
*/

	
	
	
	

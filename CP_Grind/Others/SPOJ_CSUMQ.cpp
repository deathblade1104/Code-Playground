/* Shahbaz Hasan Raja*/

#include<bits/stdc++.h>
using namespace std;
using namespace chrono;


#define fastio() ios_base::sync_with_stdio(false);cin.tie(NULL);cout.tie(NULL)
#define fast_io ios_base::sync_with_stdio(false);cin.tie(NULL)

#define endl ("\n")
#define pi (3.141592653589)
#define mod 1e9+7
#define FOR(i,a,b) for(int i=a;i<=b;i++)
#define DFOR(i,a,b) for(int i=a;i>=b;i--)
#define BUG(x) {cout << #x << " = " << x << endl;}
#define nmax 1000111


void solve()
{
    int n;
    cin>>n;
    vector<int>arr(n);

    for(int i=0;i<n;i++)
    cin>>arr[i];

    vector<int>pre_arr(n);
    pre_arr[0]=arr[0];

    for(int i=1;i<n;i++)
    pre_arr[i]=arr[i]+pre_arr[i-1];

    int q;
    cin>>q;

    for(int i=0;i<q;i++)
    {
        int l,r;
        cin>>l>>r;

        if(l!=0)
            cout<<pre_arr[r]-pre_arr[l-1]<<endl;
        else
            cout<<pre_arr[r]<<endl;

    } 
    
}



int main() {
    #ifndef ONLINE_JUDGE
    freopen("input.txt", "r", stdin);
    freopen("output.txt", "w", stdout);
    #endif 
#ifdef deathblade1104
    freopen("Error.txt", "w", stderr);
#endif
    fastio();
    auto start1 = high_resolution_clock::now();
    solve();
    auto stop1 = high_resolution_clock::now();
    auto duration = duration_cast<microseconds>(stop1 - start1);
#ifdef deathblade1104
#endif
}

// public/js/script.js
document.addEventListener('DOMContentLoaded', function() {
  const inOutLogTable = document.querySelector('#inOutLogTable');

  if (inOutLogTable) {
    inOutLogTable.addEventListener('change', function(event) {
      if (event.target.tagName === 'INPUT' && event.target.type === 'datetime-local') {
        const studentId = event.target.closest('tr').dataset.studentId;
        const checkInTime = event.target.closest('tr').querySelector('input[name="checkInTime"]').value;
        const checkOutTime = event.target.closest('tr').querySelector('input[name="checkOutTime"]').value;
        const memo = event.target.closest('tr').querySelector('input[name="memo"]').value;

        // AJAX 요청을 사용하여 서버에 데이터 저장
        fetch('/api/inOutLogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            student_id: studentId,
            check_in_time: checkInTime,
            check_out_time: checkOutTime,
            memo: memo
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          // 성공 메시지 표시 또는 UI 업데이트
        })
        .catch(error => {
          console.error('Error:', error);
          // 오류 메시지 표시
        });

        console.log('studentId:', studentId);
        console.log('checkInTime:', checkInTime);
        console.log('checkOutTime:', checkOutTime);
        console.log('memo:', memo);
      }
    });
  }
});
